-- Development-only, non-sensitive knowledge base records.
insert into public.kb_articles (topic, body, source_url)
select *
from (
  values
    (
      'off_peak',
      'Off-peak windows and unit rates vary by tariff. Aura must use the customer tariff data and never assume a saving is guaranteed.',
      'https://octopus.energy/help-and-faqs/'
    ),
    (
      'prepayment',
      'This Aura experience is designed for a prepayment customer. Avoid direct-debit-specific advice and clearly label estimates.',
      null
    )
) as seed(topic, body, source_url)
where not exists (
  select 1 from public.kb_articles existing where existing.topic = seed.topic
);
