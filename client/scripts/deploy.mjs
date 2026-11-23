// Papkani gh-pages branchiga joylaydi (GitHub Pages).
// Sayt endi Cloudflare'da; GitHub manziliga faqat yo'naltiruvchi sahifa (gh-redirect/) joylanadi:
//   node scripts/deploy.mjs gh-redirect
// Asosiy repo bilan bir xil obyekt bazasidan foydalanadi, shuning uchun
// o'zgarmagan fayllar qayta yuklanmaydi.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const git = (args, cwd) => execFileSync("git", args, { cwd, stdio: "inherit" });
const dist = path.resolve(process.argv[2] || "dist");
if (!existsSync(dist)) throw new Error(`${dist} topilmadi`);

const tmp = path.join(tmpdir(), `byx-gh-pages-${Date.now()}`);
try { execFileSync("git", ["branch", "-D", "gh-pages"], { stdio: "ignore" }); } catch {}
git(["worktree", "add", "--orphan", "-b", "gh-pages", tmp]);
try {
  cpSync(dist, tmp, { recursive: true });
  writeFileSync(path.join(tmp, ".nojekyll"), "");
  git(["add", "-A", "-f"], tmp);
  git(["commit", "-q", "-m", `Saytni yangilash ${new Date().toISOString()}`], tmp);
  git(["push", "-f", "origin", "gh-pages"], tmp);
  console.log("GitHub manzili yangilandi (yo'naltirish): https://javohir877.github.io/byhojiakbar-portfolio/");
} finally {
  git(["worktree", "remove", "--force", tmp]);
  rmSync(tmp, { recursive: true, force: true });
}
