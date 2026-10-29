-- Align the seeded ad landing-page copy with the supplied October 29 return policy.
-- Replace only the old phrases; preserve any unrelated editorial changes.
update public.landing_pages
set faqs = replace(faqs::text, $old$7-day no-questions return. Full refund if the ghee doesn't taste like the best you've had. We mean this.$old$, $new$Returns for expired, spoiled, damaged or incorrect products only. Report within 24 hours of delivery with photo proof.$new$)::jsonb
where slug = 'ghee-bangalore' and faqs::text like '%7-day no-questions return%';

update public.landing_pages
set announcement = replace(announcement, '7-day return guarantee', 'Report delivery issues within 24 hours'),
    honest_copy = replace(honest_copy,
      $old$If the ghee does not taste like the best you have had, we will refund you. No questions.$old$,
      $new$Returns for expired, spoiled, damaged or incorrect products only. Report within 24 hours of delivery with photo proof.$new$)
where slug = 'pure-ghee-truth';
