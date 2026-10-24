import { $, esc, i18n, state, copyText, toast } from "./util.js";
import { githubIcon, icon } from "./icons.js";

export function renderContact(root) {
  const p = state.content.profile;
  const link = $("#contact-github", root);
  link.href = p.links.github;

  $("#contact-why").textContent = i18n.t(i18n.strings.ct_why);
  $("#contact-note", root).innerHTML = i18n.t(i18n.strings.ct_avail).map((l) => `<li>${esc(l)}</li>`).join("");

  const copy = $("#contact-copy", root);
  copy.innerHTML = `${icon("copy")} ${esc(i18n.t(i18n.strings.ct_copy))}`;
  copy.onclick = async () => {
    await copyText(p.links.github);
    toast(i18n.t(i18n.strings.ct_copied));
  };

  $("#contact-gh-icon", root).innerHTML = githubIcon(28);
}
