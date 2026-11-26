(() => {
  'use strict';

  const root = document.getElementById('cases-root');
  if (!root) return;

  const projects = {
    basketball: {
      name: 'Basketball school', shortName: 'Basketball', icon: 'ball',
      category: 'Live project', photoDescription: 'Public Apex Sport AI coach workspace showing class training tasks, submissions and reports with illustrative records.',
      title: 'APEX SPORT AI',
      summary: 'Prospective families can explore basketball training and sample feedback before joining. Players and coaches then use one workspace for practice videos, movement analysis and training tasks.',
      productUrl: 'https://apexsportai.com/#academy',
      steps: [
        ['Player', 'Upload a practice clip', 'Players submit a video of their drill for analysis.'],
        ['System', 'Analyse the movement', 'Pose analysis turns the clip into a training report that the coach can review.'],
        ['Coach', 'Manage the training group', 'Coaches access classes, tasks and reports in one workspace.']
      ],
      measureLabel: 'Operational value', measures: 'Coaches can find the training report alongside their class tasks, reducing the need to collect videos and compile feedback by hand.',
      output: 'How the platform supports enrolment',
      fields: [['Before joining', 'A prospective family can explore a training example and see how feedback is presented.'], ['After joining', 'Players submit practice videos and coaches use the reports to review the work.']]
    },
    solar: {
      name: 'Solar installers', shortName: 'Solar', icon: 'solar',
      category: 'Industry example', photoDescription: 'A technician wearing work gloves positions a solar panel on a tiled roof.',
      title: 'Turn solar enquiries into site visits.',
      summary: 'A proposed enquiry assistant helps an installer spot quote-ready households and collect the details a site assessor needs.',
      steps: [
        ['Enquiry', 'Capture the site details', 'A homeowner shares a postcode, an electricity bill and preferred contact times.'],
        ['Assistant', 'Prepare the sales record', 'Extract the supplied details, flag gaps and draft a follow-up for the sales rep.'],
        ['Sales team', 'Book the assessment', 'A rep confirms service coverage and offers a site visit with the same record.']
      ],
      measureLabel: 'What to measure', measures: 'Enquiries that become booked site visits, and staff minutes spent requesting missing information per quote.',
      output: 'View a sample sales handoff',
      fields: [['Received', 'Service postcode and recent electricity bill'], ['To confirm', 'Roof access and a suitable assessment time'], ['Next action', 'Sales rep calls to arrange a site visit']]
    },
    education: {
      name: 'Education & training', shortName: 'Education', icon: 'education',
      category: 'Industry example', photoDescription: 'Adult learners face a projected lesson at the front of a training room.',
      title: 'Help course enquiries become enrolments.',
      summary: 'A proposed admissions assistant handles repeated course questions and gives staff a follow-up list for the next intake.',
      steps: [
        ['Enquiry', 'Understand the learner', 'A prospective learner asks about course level, evening classes and available places.'],
        ['Assistant', 'Match current options', 'Use the approved course catalogue and timetable to draft a reply with suitable intakes.'],
        ['Admissions', 'Follow up in one place', 'Staff check prerequisites and capacity, then invite the learner to an introductory session.']
      ],
      measureLabel: 'What to measure', measures: 'Enquiries that progress to enrolment, response time and staff time spent answering repeat timetable questions.',
      output: 'View a sample admissions handoff',
      fields: [['Learner request', 'Beginner level, weekday evenings'], ['To confirm', 'Places available in the next evening intake'], ['Next action', 'Admissions adviser offers an introductory session']]
    }
  };

  const icons = {
    ball: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8m0-12.8L5.6 18.4M11 3a10 10 0 0 1 10 10M3 11a10 10 0 0 1 10 10"/>',
    solar: '<path d="m4 10-2 9h20l-2-9zM8 19l1-9m6 9-1-9M3 15h18M11 6a3 3 0 0 1 6 0M14 1v1m6 1-1 1"/>',
    education: '<path d="m2 9 10-5 10 5-10 5zM6 11v5c4 3 8 3 12 0v-5m4-2v7"/>',
    input: '<path d="M4 5h11l4 4v11H4z"/><path d="M14 5v5h5M7 14h8m-8 3h5"/>',
    build: '<path d="M8 7 3 12l5 5m8-10 5 5-5 5m-3-13-2 16"/>',
    handoff: '<path d="M4 5h10v7H4zM4 18h5m4-3 3 3 5-6"/>',
    plus: '<path d="M5 12h14m-7-7v14"/>',
    measure: '<path d="M4 4v16h16M8 15l4-5 4 2 4-6"/>'
  };
  const icon = name => `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
  const entries = Object.entries(projects);

  function tabMarkup([key, project], index) {
    return `<button type="button" class="case-tab" id="case-tab-${key}" role="tab"
        aria-selected="${index === 0}" aria-controls="case-panel-${key}" tabindex="${index === 0 ? 0 : -1}"
        data-workflow="${key}" aria-label="${project.name}">
        ${icon(project.icon)}<span class="case-full-name">${project.name}</span>
        <span class="case-short-name" aria-hidden="true">${project.shortName}</span>
      </button>`;
  }

  function panelMarkup([key, project], index) {
    const stepIcons = ['input', 'build', 'handoff'];
    const steps = project.steps.map(([label, title, detail], i) => `
      <li><div class="case-path-node">${icon(stepIcons[i])}</div>
        <p class="case-label">${label}</p><h4>${title}</h4><p class="case-description">${detail}</p></li>`).join('');
    const fields = project.fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    return `<article class="case-panel" role="tabpanel" id="case-panel-${key}" tabindex="0"
        aria-labelledby="case-tab-${key}" ${index ? 'hidden' : ''}>
        <div class="case-intro"><div class="case-panel-head"><p class="case-label">${project.category}</p>
          <h3>${project.title}</h3><p class="case-summary">${project.summary}</p>
          </div><figure class="case-media">
          <div class="case-photo case-photo-${key}" role="img" aria-label="${project.photoDescription}"></div>
          ${project.productUrl ? '<figcaption><span>Apex Sport AI / Infinity Sport · Public product preview</span><a class="case-project-link" href="' + project.productUrl + '" target="_blank" rel="noopener">View live platform</a></figcaption>' : ''}</figure></div>
        <ol class="case-path">${steps}</ol>
        <p class="case-metric">${icon('measure')}<span><strong>${project.measureLabel}</strong>${project.measures}</span></p>
        <details class="case-output"><summary>${project.output}${icon('plus')}</summary><dl>${fields}</dl></details>
        <button class="case-brief" type="button" data-brief="${key}">Scope a similar project</button>
      </article>`;
  }

  root.innerHTML = `<div class="case-heading">
      <p class="case-section-label">Industry applications</p>
      <h2 id="cases-title">Business AI in practice.</h2></div>
    <div class="panel-stage"><div class="case-layout"><div class="case-tabs" role="tablist" aria-label="Projects by industry">
      ${entries.map(tabMarkup).join('')}</div><div class="case-panels">${entries.map(panelMarkup).join('')}</div></div></div>`;
  root.closest('section').setAttribute('aria-labelledby', 'cases-title');
  const demo = root.parentElement.querySelector('.lead-demo');
  root.querySelector('#case-panel-solar .case-path').before(demo);
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
  const compact = matchMedia('(max-width: 760px)');
  const tablist = root.querySelector('[role="tablist"]');

  function select(tab) {
    tabs.forEach((item, index) => {
      const active = tab === item;
      item.tabIndex = active ? 0 : -1;
      item.setAttribute('aria-selected', String(active));
      panels[index].hidden = !active;
    });
  }
  function updateOrientation() {
    tablist.setAttribute('aria-orientation', compact.matches ? 'horizontal' : 'vertical');
  }
  updateOrientation();
  compact.addEventListener('change', updateOrientation);
  tablist.addEventListener('click', event => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) select(tab);
  });
  tablist.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    const prev = compact.matches ? 'ArrowLeft' : 'ArrowUp';
    const next = compact.matches ? 'ArrowRight' : 'ArrowDown';
    const moves = { [prev]: (index + tabs.length - 1) % tabs.length, [next]: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!Object.hasOwn(moves, event.key)) return;
    event.preventDefault();
    const tab = tabs[moves[event.key]];
    select(tab);
    tab.focus();
  });
})();
