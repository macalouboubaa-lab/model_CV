alter table public.payments
  drop constraint if exists payments_model_id_check,
  add constraint payments_model_id_format_check
    check (model_id ~ '^model[1-9][0-9]{0,3}$');

alter table public.entitlements
  drop constraint if exists entitlements_model_id_check,
  add constraint entitlements_model_id_format_check
    check (model_id ~ '^model[1-9][0-9]{0,3}$');
