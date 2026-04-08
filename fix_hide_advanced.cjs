const fs = require('fs');
let content = fs.readFileSync('src/features/quiz/components/QuizConfig.tsx', 'utf8');

// The grid div is closed at line 431 with `</div>`.
// But there is also an Accordion and ActiveFiltersBar, and a Sticky Action Footer that needs to be conditionally hidden if mode === 'god'.

// Hide Accordion
content = content.replace(
  `        {/* Progressive Disclosure: Advanced Filters Accordion */}\n        <Accordion title="Advanced Filters">`,
  `        {/* Progressive Disclosure: Advanced Filters Accordion */}\n        {mode !== 'god' && (\n        <Accordion title="Advanced Filters">`
);

content = content.replace(
  `        </Accordion>\n\n        {/* Active Filters Displayed above sticky footer area */}`,
  `        </Accordion>\n        )}\n\n        {/* Active Filters Displayed above sticky footer area */}`
);

// Hide ActiveFiltersBar
content = content.replace(
  `        {/* Active Filters Displayed above sticky footer area */}\n        <div className="pb-8">`,
  `        {/* Active Filters Displayed above sticky footer area */}\n        {mode !== 'god' && (\n        <div className="pb-8">`
);

content = content.replace(
  `          />\n        </div>\n      </div>\n\n      {/* Sticky Action Footer */}`,
  `          />\n        </div>\n        )}\n      </div>\n\n      {/* Sticky Action Footer */}`
);

// Hide Sticky Action Footer
content = content.replace(
  `      {/* Sticky Action Footer */}\n      <div className="fixed bottom-0 left-0 w-full z-[40]`,
  `      {/* Sticky Action Footer */}\n      {mode !== 'god' && (\n      <div className="fixed bottom-0 left-0 w-full z-[40]`
);

content = content.replace(
  `      </div>\n    </div>\n  );\n};`,
  `      </div>\n      )}\n    </div>\n  );\n};`
);


fs.writeFileSync('src/features/quiz/components/QuizConfig.tsx', content);
