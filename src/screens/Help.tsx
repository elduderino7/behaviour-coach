import { fill, safety, ui } from '../content';

export function Help() {
  return (
    <section>
      <h1>{safety.title}</h1>
      <p>{safety.intro}</p>
      <ul class="contacts">
        {safety.contacts.map((c) => (
          <li key={c.number}>
            <a
              class="call"
              href={`tel:${c.number.replace(/\s/g, '')}`}
              aria-label={`${c.label}. ${fill(ui.call_label, { number: c.number })}`}
            >
              <span class="call-label">{c.label}</span>
              <span class="call-number">{c.number}</span>
            </a>
            <p class="note">{c.note}</p>
          </li>
        ))}
      </ul>
      <p>{safety.professional_help}</p>
      <p>{safety.exclusions}</p>
      <p class="note">{safety.about_this_app}</p>
    </section>
  );
}
