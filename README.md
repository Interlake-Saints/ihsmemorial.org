# ihsmemorial.org

site to notify those of us who attended Interlake High School of the classmates we've lost

## Build

Tasks are managed with rake.

This site is written with jekyll. For more on jekyll see https://jekyllrb.com/docs/.

Entries are in \_posts. Each field means as follows:

- title: The name of the person.
- date: The date of death in YYYY-MM-DD format.
- categories: Either the class in the form of "class-of-1974" or "staff". Can contain multiple values in cases where the person was both staff and student.
- tags: The causes of death. Use the tags in \_cause.
- images: A list of URLs to images. Ideally local images such as "/assets/241166_1771058511999_6511222_o.jpg"

The current build status is [![Netlify Status](https://api.netlify.com/api/v1/badges/99da697e-e799-4653-860a-835d4e2dbacb/deploy-status)](https://app.netlify.com/sites/nostalgic-mestorf-f3c08f/deploys).

The site has the following dependencies:

- Segment.com for third party integrations
- Google Analytics for analytics
- Amazon S3 for logs
- Disqus for comments
- Netlify CMS for content management
- Netlify for hosting
- Netlify for DNS

calef maintains the access credentials for these resources.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Interlake-Saints/ihsmemorial.org)
