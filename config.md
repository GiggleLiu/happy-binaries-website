<!--
Add here global page variables to use throughout your website.
-->
+++
author = "GiggleLiu"
mintoclevel = 2

# uncomment and adjust the following line if the expected base URL of your website is something like [www.thebase.com/yourproject/]
# please do read the docs on deployment to avoid common issues: https://franklinjl.org/workflow/deploy/#deploying_your_website
# prepath = "yourproject"

# Add here files or directories that should be ignored by Franklin, otherwise
# these files might be copied and, if markdown, processed by Franklin which
# you might not want. Indicate directories by ending the name with a `/`.
# Base files such as LICENSE.md and README.md are ignored by default.
ignore = ["node_modules/", r".*\.swp"]

# RSS (the website_{title, descr, url} must be defined to get RSS)
generate_rss = true
website_title = "Jin-Guo Liu Group"
website_descr = "Jin-Guo Liu Group Website"
prepath = get(ENV, "PREVIEW_FRANKLIN_PREPATH", "happy-binaries-website") # In the third argument put the prepath you normally use
website_url = get(ENV, "PREVIEW_FRANKLIN_WEBSITE_URL", "giggleliu.github.io/happy-binaries-website/") # Just put the website name
+++

<!--
Add here global latex commands to use throughout your pages.
-->
\newcommand{\R}{\mathbb R}
\newcommand{\scal}[1]{\langle #1 \rangle}
