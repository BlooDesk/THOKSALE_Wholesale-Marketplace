-- =====================================================================
-- ThokSale - Optional trigger for auto-creating profile rows on signup.
-- =====================================================================
-- NOTE: The Next.js server actions already create profile + company rows
-- using the service-role key. This trigger is provided as an extra safety
-- net in case a user signs up outside the Next.js app (e.g. via Supabase
-- dashboard, mobile app, direct API). It uses raw_user_meta_data set at
-- signUp time via options.data.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    v_role user_role;
begin
    -- default to buyer if missing/invalid
    begin
        v_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'buyer')::user_role;
    exception when others then
        v_role := 'buyer';
    end;

    -- SECURITY: Never allow admin role via signup metadata (H6)
    if v_role = 'admin' then
        v_role := 'buyer';
    end if;

    insert into public.profiles (id, role, full_name, email, phone, is_active)
    values (
        new.id,
        v_role,
        new.raw_user_meta_data ->> 'full_name',
        new.email,
        new.raw_user_meta_data ->> 'phone',
        true
    )
    on conflict (id) do nothing;

    if v_role = 'seller'
       and coalesce(new.raw_user_meta_data ->> 'company_name', '') <> '' then
        insert into public.company_profiles (
            profile_id, legal_name, display_name, tax_id, contact_email, contact_phone
        )
        values (
            new.id,
            new.raw_user_meta_data ->> 'company_name',
            new.raw_user_meta_data ->> 'company_name',
            new.raw_user_meta_data ->> 'gst_number',
            new.email,
            new.raw_user_meta_data ->> 'phone'
        )
        on conflict (profile_id) do nothing;
    end if;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
