const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'admin', 'WebsiteBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix line 2617: Close the grid, the flex-1 container, and the three-panel flex container
const target2617 = `          </div>\r\n        )}\r\n\r\n      </div>\r\n\r\n      {/* PAGE SETTINGS & SEO MODAL */}`;
const fixed2617 = `          </div>\r\n        )}\r\n\r\n          </div>\r\n        </div>\r\n      </div>\r\n\r\n      {/* PAGE SETTINGS & SEO MODAL */}`;

if (content.includes(target2617)) {
  content = content.replace(target2617, fixed2617);
} else {
  // Try normalized
  const targetNorm = `          </div>\n        )}\n\n      </div>\n\n      {/* PAGE SETTINGS & SEO MODAL */}`;
  const fixedNorm = `          </div>\n        )}\n\n          </div>\n        </div>\n      </div>\n\n      {/* PAGE SETTINGS & SEO MODAL */}`;
  content = content.replace(targetNorm, fixedNorm);
}

// 2. Remove the misplaced closing tags at line 2754
const misplacedClosing = `      {/* HEADER & FOOTER SETTINGS MODAL */}\r\n      </div>\r\n        </div>\r\n      </div>\r\n\r\n      {/* Pre-Publish Quality Audit Modal */}`;
const cleanedMisplaced = `      {/* Pre-Publish Quality Audit Modal */}`;

if (content.includes(misplacedClosing)) {
  content = content.replace(misplacedClosing, cleanedMisplaced);
} else {
  const misplacedNorm = `      {/* HEADER & FOOTER SETTINGS MODAL */}\n      </div>\n        </div>\n      </div>\n\n      {/* Pre-Publish Quality Audit Modal */}`;
  content = content.replace(misplacedNorm, cleanedMisplaced);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed builder closing tags!');

