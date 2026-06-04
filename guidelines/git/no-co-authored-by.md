# Don't add Co-Authored-By trailers

Never add a `Co-Authored-By` trailer to a commit message — in any repo. Write the commit
message and stop; don't append co-author attribution for the agent or the tooling.

**Why:** commit history should attribute work to the human author. Tool co-authorship
clutters the log and muddies `git blame` and contributor stats.
