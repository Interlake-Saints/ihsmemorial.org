task :default => :test

desc "Run tests"
task test: %w[build] do
  sh "bundle exec htmlproofer --log-level :warn ./_site &> links.log"
end

desc "Build the site"
task build: %w[clean] do
  sh "bundle exec jekyll build --drafts"
end

desc "Clean up"
task :clean do
  sh "rm -rf ./_site ./links.log ./.jekyll-cache ./.jekyll-metadata"
end

desc "Start up the site"
task go: %w[clean] do
  sh "bundle exec jekyll serve --livereload"
end
