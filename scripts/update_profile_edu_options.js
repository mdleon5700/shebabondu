const fs = require("fs");
const path = require("path");

const profilePath = path.join(__dirname, "../src/app/dashboard/profile/page.tsx");
let profileSrc = fs.readFileSync(profilePath, "utf8");

const oldSelect = `                    <select
                      value={eduLevel}
                      onChange={(e) => setEduLevel(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                    >
                      <option value="স্নাতক (অনার্স)">স্নাতক (অনার্স) / সমমান</option>
                      <option value="স্নাতকোত্তর (মাস্টার্স)">স্নাতকোত্তর (মাস্টার্স)</option>
                      <option value="উচ্চ মাধ্যমিক (HSC)">উচ্চ মাধ্যমিক (HSC) / আলিম</option>
                      <option value="ডিপ্লোমা ইন ইঞ্জিনিয়ারিং">ডিপ্লোমা ইন ইঞ্জিনিয়ারিং</option>
                      <option value="মাধ্যমিক (SSC)">মাধ্যমিক (SSC) / দাখিল</option>
                    </select>`;

const newSelect = `                    <select
                      value={eduLevel}
                      onChange={(e) => setEduLevel(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                    >
                      <option value="জেএসসি (JSC) / জেডিসি (JDC)">জেএসসি (JSC) / জেডিসি (JDC) / ৮ম শ্রেণি</option>
                      <option value="মাধ্যমিক (SSC)">মাধ্যমিক (SSC) / দাখিল</option>
                      <option value="উচ্চ মাধ্যমিক (HSC)">উচ্চ মাধ্যমিক (HSC) / আলিম</option>
                      <option value="ডিপ্লোমা ইন ইঞ্জিনিয়ারিং">ডিপ্লোমা ইন ইঞ্জিনিয়ারিং / কারিগরি / মেডিকেল</option>
                      <option value="ডিগ্রি (পাস কোর্স)">ডিগ্রি (পাস কোর্স) - ৩ বছর মেয়াদী</option>
                      <option value="স্নাতক (অনার্স)">স্নাতক (অনার্স) / সমমান - ৪ বছর মেয়াদী</option>
                      <option value="স্নাতকোত্তর (মাস্টার্স)">স্নাতকোত্তর (মাস্টার্স) / কামিল</option>
                      <option value="উচ্চতর গবেষণা (এমফিল / পিএইচডি)">উচ্চতর গবেষণা (এমফিল / পিএইচডি)</option>
                    </select>`;

profileSrc = profileSrc.replace(oldSelect, newSelect);
fs.writeFileSync(profilePath, profileSrc, "utf8");
console.log("Updated Profile education modal options with JSC, JDC, Degree Pass, Kamil, MPhil/PhD");