-- Sample devices were inserted automatically. A home starts with none.
-- Security and other match the add-device screen.

alter table public.household_devices drop constraint if exists household_devices_category_check;
alter table public.household_devices
  add constraint household_devices_category_check
  check (category in ('climate', 'lighting', 'appliance', 'ev', 'security', 'other'));

delete from public.household_devices;
