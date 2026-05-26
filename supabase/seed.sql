-- ============================================================
-- Frich OS · Declarative Seed
-- Versionado y reproducible: corré `pnpm db:seed` o `psql -f`.
-- Idempotente: usa upsert por slugs naturales.
-- ============================================================

-- 1) Tenant base: chain "frich" (el cliente original)
insert into chains (slug, name, brand_color, timezone, currency)
values ('frich', 'Frich', '#FCD33B', 'America/Argentina/Cordoba', 'ARS')
on conflict (slug) do update
  set name = excluded.name,
      brand_color = excluded.brand_color,
      timezone = excluded.timezone,
      currency = excluded.currency;

-- chain settings (mismo JSON que la migration 0011 — se mantienen sincronizados)
update chains
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
  'brand', jsonb_build_object(
    'name', 'Frich',
    'tagline', 'American Burgers ''n Fries',
    'logo_url', '/brand/frich-logo.png',
    'primary_color', '#FCD33B',
    'secondary_color', '#0B0B0E'
  ),
  'station_baseline_seconds', jsonb_build_object('armado',100,'plancha',140,'freidora',160,'despacho',45),
  'station_baseline_sigma',  jsonb_build_object('armado',18,'plancha',14,'freidora',12,'despacho',8),
  'dbr_buffer_seconds', jsonb_build_object(
    'plancha', jsonb_build_array(180,240),
    'freidora', jsonb_build_array(120,180),
    'armado', jsonb_build_array(90,150),
    'despacho', jsonb_build_array(60,90)
  ),
  'turbo_thresholds', jsonb_build_object(
    'utilization',0.85,'queue_depth',8,'eta_to_idle_sec',600,
    'red_pct',0.25,'min_criteria',2,'min_cooldown_sec',300
  ),
  'channel_commission_pct', jsonb_build_object(
    'rappi',0.21,'pedidosya',0.22,'whatsapp',0,'salon',0,'web',0.04,'kiosk',0
  ),
  'sla', jsonb_build_object(
    'promise_padding_ratio',1.18,'door_to_door_target_minutes',35,'convergence_window_seconds',30
  ),
  'kpi_targets', jsonb_build_object(
    'cpk_plancha_min',1.33,'cpk_armado_min',1.20,'cpk_despacho_min',1.50,
    'sigma_cross_location_max_pct',15,'red_orders_max_pct',5,'nps_min',60,
    'food_cost_max_deviation_pp',1.5,'copq_max_pct',1.0
  ),
  'pin_session_ttl_seconds', 43200,
  'calibration_mode_min_observations', 200,
  'food_cost_default_pct', 0.32
)
where slug = 'frich';

-- 2) Locations (4 reales)
with c as (select id from chains where slug='frich')
insert into locations (chain_id, slug, name, short_name, city, has_dining_area, current_mode)
select c.id, x.slug, x.name, x.short, 'Córdoba', x.dining, 'normal'::kitchen_mode
from c, (values
  ('nueva-cordoba',          'Nueva Córdoba',              'Nueva Cba',  true),
  ('jesus-maria',            'Jesús María',                'Jesús Mª',   true),
  ('valle-escondido',        'Valle Escondido',            'Valle Esc.', true),
  ('nueva-cordoba-delivery', 'Nueva Córdoba — Delivery',  'Nva Cba D',  false)
) as x(slug,name,short,dining)
on conflict (chain_id, slug) do update
  set name = excluded.name, short_name = excluded.short_name, has_dining_area = excluded.has_dining_area;

-- 3) Stations (4 por local)
with c as (select id as chain_id from chains where slug='frich'),
     locs as (select id, slug from locations where chain_id = (select chain_id from c))
insert into stations (chain_id, location_id, slug, name, display_order)
select (select chain_id from c), l.id, s.slug::station_slug, s.name, s.ord
from locs l
cross join (values ('armado','Armado',1),('plancha','Plancha',2),('freidora','Freidora',3),('despacho','Despacho',4)) s(slug,name,ord)
on conflict (location_id, slug) do nothing;

-- 4) Product categories
with c as (select id from chains where slug='frich')
insert into product_categories (chain_id, slug, name, display_order)
select (select id from c), x.slug, x.name, x.ord from (values
  ('burgers','American Burgers',1),
  ('novedades','Novedades',2),
  ('nuggets','Nuggets',3),
  ('veggies','Veggies',4),
  ('extras','Extras',99)
) x(slug,name,ord)
on conflict (chain_id, slug) do nothing;

-- 5) Products (carta canónica — sincronizada con info/carta_frich.md)
-- Si la carta cambia, regenerá este bloque y volvé a correr el seed.
with c as (select id from chains where slug='frich'),
     cat as (select id, slug from product_categories where chain_id = (select id from c))
insert into products (chain_id, category_id, slug, name, description, price_cents, cost_cents, is_veggie, beyond_meat_option, complexity_factor, allergens)
select (select id from c),
       (select id from cat where slug = p.cat),
       p.slug, p.name, p.descr, (p.price * 100)::int, (p.cost * 100)::int,
       p.veggie, p.beyond, p.cx, p.allergens
from (values
  ('burgers','california','California','Doble medallón + cuádruple cheddar + thousand island + pepinillos + cebolla morada + lechuga + tomate. Papas incluidas.',14000,4900,false,false,1.2,array['gluten','lacteos']::text[]),
  ('burgers','doble-cheese','Doble Cheese Burger','Doble medallón + cuádruple cheddar + ketchup + mostaza americana + pepinillos + cebolla picada. Papas incluidas.',13000,4500,false,false,1.0,array['gluten','lacteos']::text[]),
  ('burgers','bell-pepper','Bell Pepper','Doble medallón + cuádruple cheddar + panceta + pimientos salteados + thousand island. Papas incluidas.',15000,5400,false,false,1.3,array['gluten','lacteos']::text[]),
  ('burgers','big-em','Big Em','Doble medallón + cuádruple cheddar + thousand island + pepinillos + cebolla picada + lechuga. Papas incluidas.',13500,4700,false,false,1.1,array['gluten','lacteos']::text[]),
  ('burgers','doble-burger','Doble Burger','Doble medallón + cuádruple cheddar. Papas incluidas.',12000,4100,false,false,0.9,array['gluten','lacteos']::text[]),
  ('burgers','grand-bacon','Grand Bacon','Doble medallón + thousand island + doble panceta + cuádruple cheddar. Papas incluidas.',15500,5600,false,false,1.2,array['gluten','lacteos']::text[]),
  ('burgers','bacon-cheese','Bacon Cheese','Doble medallón + panceta + ketchup + mostaza + cebolla morada + pepino + cuádruple cheddar. Papas incluidas.',15000,5400,false,false,1.2,array['gluten','lacteos']::text[]),
  ('burgers','fried-onion','Fried Onion','Doble medallón cocido con cebolla en delgadas capas + cuádruple cheddar. Papas incluidas.',13000,4600,false,false,1.5,array['gluten','lacteos']::text[]),
  ('burgers','western','Western','Doble medallón + barbacoa + panceta + aros de cebolla fritos + cuádruple cheddar. Papas incluidas.',15500,5700,false,false,1.4,array['gluten','lacteos']::text[]),
  ('burgers','patty-melt','Patty Melt','Pan de molde tostado con manteca + doble medallón + cebolla grillada + thousand island + cuádruple cheddar. Papas incluidas.',14000,5000,false,false,1.3,array['gluten','lacteos']::text[]),
  ('novedades','chicken-deluxe','Chicken Deluxe','Mayonesa + lechuga + cheddar + pollo crispy. Papas incluidas.',9500,3300,false,false,1.0,array['gluten','lacteos','huevo']::text[]),
  ('novedades','chicken-spicy','Chicken Spicy','Salsa spicy picante + panceta ahumada + pollo crispy. Papas incluidas.',9500,3400,false,false,1.0,array['gluten','lacteos']::text[]),
  ('novedades','egg-n-bacon','Egg ''n Bacon','Sandwich de huevo, panceta ahumada, doble cheddar, pan tostado en manteca. Papas incluidas.',9900,3500,false,false,1.1,array['gluten','lacteos','huevo']::text[]),
  ('novedades','crunch','Crunch','Sin pan, envuelta en lechuga repollada. Doble carne smash + cuádruple cheddar + thousand island + cebolla morada + tomate + pepinillos. Papas incluidas.',10500,3700,false,false,1.6,array['lacteos']::text[]),
  ('nuggets','nuggets-1','Nuggets 1u','1 unidad de nugget de pollo.',600,180,false,false,0.4,array['gluten']::text[]),
  ('nuggets','nuggets-10','Nuggets 10u','10 unidades de nuggets de pollo.',5500,1700,false,false,0.6,array['gluten']::text[]),
  ('nuggets','nuggets-20','Nuggets 20u','20 unidades de nuggets de pollo.',9500,3000,false,false,0.8,array['gluten']::text[]),
  ('veggies','veggie-california','California Veggie','Medallón veggie + doble cheddar + thousand island + pepinillos + cebolla morada + lechuga + tomate. Papas incluidas.',12000,4200,true,true,1.2,array['gluten','lacteos']::text[]),
  ('veggies','veggie-doble-cheese','Doble Cheese Veggie','Medallón veggie + doble cheddar + ketchup + mostaza + pepinillos + cebolla picada. Papas incluidas.',12000,4100,true,true,1.0,array['gluten','lacteos']::text[]),
  ('veggies','veggie-bell-pepper','Bell Pepper Veggie','Medallón veggie + pimientos salteados + thousand island. Papas incluidas.',12000,4200,true,true,1.2,array['gluten','lacteos']::text[]),
  ('veggies','veggie-big-em','Big Em Veggie','Medallón veggie + doble cheddar + thousand island + pepinillos + cebolla morada + lechuga. Papas incluidas.',12000,4100,true,true,1.1,array['gluten','lacteos']::text[]),
  ('veggies','veggie-doble-burger','Doble Burger Veggie','Medallón veggie + cuádruple cheddar. Papas incluidas.',12000,4000,true,true,0.9,array['gluten','lacteos']::text[]),
  ('extras','extra-patty','Medallón extra','Sumá un medallón a tu burger.',2400,800,false,false,0.5,array['lacteos']::text[]),
  ('extras','extra-martins','Pan Martin''s','Cambio a pan Martin''s premium.',2500,700,false,false,0.2,array['gluten','lacteos']::text[]),
  ('extras','extra-aderezo','Pote de aderezos','Pote extra de aderezo.',400,80,false,false,0.1,'{}'::text[]),
  ('extras','extra-bacon','Extra bacon','Sumá más panceta.',900,300,false,false,0.2,'{}'::text[]),
  ('extras','extra-papas','Papas fritas','Porción extra de papas fritas.',2900,800,false,false,0.4,'{}'::text[]),
  ('extras','extra-aros','Aros de cebolla','Porción de aros de cebolla.',2900,900,false,false,0.5,array['gluten']::text[])
) as p(cat,slug,name,descr,price,cost,veggie,beyond,cx,allergens)
on conflict (chain_id, slug) do update
  set price_cents = excluded.price_cents,
      cost_cents = excluded.cost_cents,
      complexity_factor = excluded.complexity_factor;

-- 6) Product station steps (baseline_no_data — la calibración recalibra después)
with c as (select id from chains where slug='frich'),
     p as (select id, slug from products where chain_id = (select id from c))
insert into product_station_steps (chain_id, product_id, station_slug, sequence, target_seconds, sigma_seconds, quality_window_seconds, confidence_level)
select (select id from c), p.id, x.st::station_slug, 1, x.t, x.s, x.qw, 'baseline_no_data'
from p
join (values
  ('california','armado',95,15,60),('california','plancha',120,12,600),('california','freidora',140,10,3600),('california','despacho',35,8,null),
  ('doble-cheese','armado',90,15,60),('doble-cheese','plancha',120,12,600),('doble-cheese','freidora',140,10,3600),('doble-cheese','despacho',35,8,null),
  ('bell-pepper','armado',105,18,60),('bell-pepper','plancha',135,14,600),('bell-pepper','freidora',140,10,3600),('bell-pepper','despacho',35,8,null),
  ('big-em','armado',95,16,60),('big-em','plancha',125,13,600),('big-em','freidora',140,10,3600),('big-em','despacho',35,8,null),
  ('doble-burger','armado',80,12,60),('doble-burger','plancha',115,11,600),('doble-burger','freidora',140,10,3600),('doble-burger','despacho',30,7,null),
  ('grand-bacon','armado',100,16,60),('grand-bacon','plancha',130,14,600),('grand-bacon','freidora',140,10,3600),('grand-bacon','despacho',35,8,null),
  ('bacon-cheese','armado',100,16,60),('bacon-cheese','plancha',130,14,600),('bacon-cheese','freidora',140,10,3600),('bacon-cheese','despacho',35,8,null),
  ('fried-onion','armado',175,32,60),('fried-onion','plancha',180,25,600),('fried-onion','freidora',140,10,3600),('fried-onion','despacho',40,9,null),
  ('western','armado',140,22,60),('western','plancha',135,14,600),('western','freidora',180,14,3600),('western','despacho',40,9,null),
  ('patty-melt','armado',155,25,60),('patty-melt','plancha',165,20,600),('patty-melt','freidora',140,10,3600),('patty-melt','despacho',35,8,null),
  ('chicken-deluxe','armado',85,14,60),('chicken-deluxe','freidora',220,22,3600),('chicken-deluxe','despacho',35,8,null),
  ('chicken-spicy','armado',85,14,60),('chicken-spicy','plancha',60,8,600),('chicken-spicy','freidora',220,22,3600),('chicken-spicy','despacho',35,8,null),
  ('egg-n-bacon','armado',95,15,60),('egg-n-bacon','plancha',140,18,600),('egg-n-bacon','freidora',140,10,3600),('egg-n-bacon','despacho',35,8,null),
  ('crunch','armado',210,38,30),('crunch','plancha',120,12,600),('crunch','freidora',140,10,3600),('crunch','despacho',40,9,null),
  ('nuggets-1','freidora',60,8,3600),('nuggets-1','despacho',15,4,null),
  ('nuggets-10','freidora',180,15,3600),('nuggets-10','despacho',20,5,null),
  ('nuggets-20','freidora',280,22,3600),('nuggets-20','despacho',25,6,null),
  ('veggie-california','armado',95,18,60),('veggie-california','plancha',105,18,600),('veggie-california','freidora',140,10,3600),('veggie-california','despacho',35,8,null),
  ('veggie-doble-cheese','armado',90,18,60),('veggie-doble-cheese','plancha',105,18,600),('veggie-doble-cheese','freidora',140,10,3600),('veggie-doble-cheese','despacho',35,8,null),
  ('veggie-bell-pepper','armado',105,20,60),('veggie-bell-pepper','plancha',120,20,600),('veggie-bell-pepper','freidora',140,10,3600),('veggie-bell-pepper','despacho',35,8,null),
  ('veggie-big-em','armado',95,18,60),('veggie-big-em','plancha',110,18,600),('veggie-big-em','freidora',140,10,3600),('veggie-big-em','despacho',35,8,null),
  ('veggie-doble-burger','armado',80,16,60),('veggie-doble-burger','plancha',100,16,600),('veggie-doble-burger','freidora',140,10,3600),('veggie-doble-burger','despacho',30,7,null)
) as x(slug,st,t,s,qw) on p.slug = x.slug
on conflict (product_id, station_slug, sequence) do update
  set target_seconds = excluded.target_seconds,
      sigma_seconds = excluded.sigma_seconds,
      quality_window_seconds = excluded.quality_window_seconds;

-- 7) Employees demo + PIN via set_employee_pin function
do $$
declare
  v_chain_id uuid;
  v_loc_id uuid;
  v_emp_id uuid;
  rec record;
begin
  select id into v_chain_id from chains where slug = 'frich';
  for rec in
    select * from (values
      ('nueva-cordoba','María','González','plancha','1234'),
      ('nueva-cordoba','Joaquín','Pérez','armado','2345'),
      ('nueva-cordoba','Camila','López','freidora','3456'),
      ('nueva-cordoba','Federico','Ramírez','despacho','4567'),
      ('nueva-cordoba','Sol','Fernández','plancha','5678'),
      ('nueva-cordoba','Lautaro','Suárez','armado','6789'),
      ('jesus-maria','Ana','Martínez','plancha','1234'),
      ('jesus-maria','Bruno','Castro','armado','2345'),
      ('jesus-maria','Caro','Vega','freidora','3456'),
      ('jesus-maria','Diego','Romero','despacho','4567'),
      ('jesus-maria','Eli','Núñez','plancha','5678'),
      ('jesus-maria','Fede','Quiroga','armado','6789'),
      ('valle-escondido','Gabi','Sosa','plancha','1234'),
      ('valle-escondido','Hernán','Molina','armado','2345'),
      ('valle-escondido','Inés','Acosta','freidora','3456'),
      ('valle-escondido','Julián','Díaz','despacho','4567'),
      ('valle-escondido','Karen','Pereyra','plancha','5678'),
      ('valle-escondido','Lucas','Brizuela','armado','6789'),
      ('nueva-cordoba-delivery','Mariano','Salgado','plancha','1234'),
      ('nueva-cordoba-delivery','Nadia','Cabrera','armado','2345'),
      ('nueva-cordoba-delivery','Oscar','Funes','freidora','3456'),
      ('nueva-cordoba-delivery','Paula','Olmos','despacho','4567'),
      ('nueva-cordoba-delivery','Ramiro','Torres','plancha','5678'),
      ('nueva-cordoba-delivery','Sabrina','Vázquez','armado','6789')
    ) as t(loc, first_name, last_name, station, pin)
  loop
    select id into v_loc_id from locations where slug = rec.loc and chain_id = v_chain_id;
    select id into v_emp_id from employees
      where chain_id = v_chain_id and location_id = v_loc_id and first_name = rec.first_name and last_name = rec.last_name;
    if v_emp_id is null then
      insert into employees (chain_id, location_id, first_name, last_name, default_station_slug, pin_hash, active)
      values (v_chain_id, v_loc_id, rec.first_name, rec.last_name, rec.station::station_slug,
              extensions.crypt(rec.pin || (select value from app_secrets where key='pin_pepper'), extensions.gen_salt('bf', 8)),
              true)
      returning id into v_emp_id;
    end if;
  end loop;
end $$;

-- 8) Skills matrix demo (default station = nivel 3-4, otras 1-2)
with emps as (select id, default_station_slug, chain_id from employees where chain_id = (select id from chains where slug='frich'))
insert into skills_matrix (chain_id, employee_id, station_slug, level)
select e.chain_id, e.id, s,
  case when s = e.default_station_slug then 3 + (random()*1)::int else 1 + (random()*1)::int end
from emps e
cross join (select unnest(enum_range(null::station_slug)) as s) stations
on conflict (employee_id, station_slug) do nothing;

-- 9) Sample in-flight orders — 14 across the 4 locations
with c as (select id as chain_id from chains where slug='frich')
select place_order_with_items(
  (select chain_id from c),
  (select id from locations where slug = l_slug and chain_id = (select chain_id from c)),
  ch::channel_slug, cust_name, cust_phone, items, vip, null::text,
  now() + (sla_minutes::text || ' minutes')::interval, driver_eta
)
from (values
  ('nueva-cordoba','rappi','Lucía R.', '+5493515551001', '[{"product_slug":"doble-cheese","qty":1,"modifiers":["sin pepinillo"]},{"product_slug":"chicken-deluxe","qty":1,"modifiers":[]}]'::jsonb, false, 18, 480),
  ('nueva-cordoba','pedidosya','Mateo G.', '+5493515551002', '[{"product_slug":"california","qty":2,"modifiers":[]},{"product_slug":"nuggets-10","qty":1,"modifiers":[]}]'::jsonb, false, 14, 420),
  ('nueva-cordoba','whatsapp','Sofía M.', '+5493515551003', '[{"product_slug":"crunch","qty":1,"modifiers":["sin tomate"]}]'::jsonb, true, 9, 360),
  ('nueva-cordoba','salon','Manuel Z.', null, '[{"product_slug":"bell-pepper","qty":1,"modifiers":[]},{"product_slug":"extra-papas","qty":1,"modifiers":[]}]'::jsonb, false, 22, null),
  ('jesus-maria','rappi','Tomás L.', '+5493525551001', '[{"product_slug":"fried-onion","qty":2,"modifiers":[]}]'::jsonb, false, 16, 540),
  ('jesus-maria','pedidosya','Valentina C.', '+5493525551002', '[{"product_slug":"western","qty":1,"modifiers":["sin cebolla"]},{"product_slug":"chicken-spicy","qty":1,"modifiers":[]}]'::jsonb, false, 12, 360),
  ('jesus-maria','salon','Iván A.', null, '[{"product_slug":"big-em","qty":1,"modifiers":[]}]'::jsonb, false, 8, null),
  ('valle-escondido','rappi','Camila O.', '+5493515551101', '[{"product_slug":"patty-melt","qty":1,"modifiers":[]},{"product_slug":"egg-n-bacon","qty":1,"modifiers":[]}]'::jsonb, false, 20, 480),
  ('valle-escondido','whatsapp','Rocío N.', '+5493515551102', '[{"product_slug":"veggie-california","qty":1,"modifiers":["beyond meat"]},{"product_slug":"extra-aros","qty":1,"modifiers":[]}]'::jsonb, true, 15, 420),
  ('valle-escondido','salon','Bruno T.', null, '[{"product_slug":"doble-burger","qty":2,"modifiers":[]},{"product_slug":"nuggets-20","qty":1,"modifiers":[]}]'::jsonb, false, 18, null),
  ('nueva-cordoba-delivery','rappi','Diego P.', '+5493515551201', '[{"product_slug":"grand-bacon","qty":1,"modifiers":[]},{"product_slug":"extra-bacon","qty":1,"modifiers":[]}]'::jsonb, false, 24, 600),
  ('nueva-cordoba-delivery','pedidosya','Lara B.', '+5493515551202', '[{"product_slug":"bacon-cheese","qty":2,"modifiers":["sin cebolla"]}]'::jsonb, false, 19, 540),
  ('nueva-cordoba-delivery','rappi','Pedro S.', '+5493515551203', '[{"product_slug":"chicken-deluxe","qty":3,"modifiers":[]}]'::jsonb, false, 7, 240),
  ('nueva-cordoba-delivery','whatsapp','Florencia M.', '+5493515551204', '[{"product_slug":"california","qty":1,"modifiers":["extra papas"]},{"product_slug":"veggie-doble-cheese","qty":1,"modifiers":[]}]'::jsonb, true, 16, 480)
) as o(l_slug, ch, cust_name, cust_phone, items, vip, sla_minutes, driver_eta)
where not exists (select 1 from orders where chain_id = (select chain_id from c) and customer_phone = o.cust_phone limit 1);

-- Done.
select 'seed_complete' as status,
  (select count(*) from chains where slug='frich') as chains,
  (select count(*) from locations) as locations,
  (select count(*) from stations) as stations,
  (select count(*) from products) as products,
  (select count(*) from product_station_steps) as steps,
  (select count(*) from employees) as employees,
  (select count(*) from skills_matrix) as skills,
  (select count(*) from orders) as orders,
  (select count(*) from kaizen_templates) as kaizen_templates;
