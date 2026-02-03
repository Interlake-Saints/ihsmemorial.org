<div align="center">
  <h1>ihsmemorial.org</h1>
  <p>
    site to notify those of us who attended Interlake High School of the classmates we've lost
  </p>
</div>

<br />

<!-- Table of Contents -->
# :notebook_with_decorative_cover: Table of Contents

- [Tech Stack](#space_invader-tech-stack)
- [Getting Started](#toolbox-getting-started)
  * [Run Locally](#running-run-locally)
  * [How to author entries](#how-to-author-entries)
- [License](#warning-license)

<!-- TechStack -->
### :space_invader: Tech Stack

<details>
  <summary>Posts</summary>
  <ul>
    <li><a href="https://jekyllrb.com/docs/">Jekyll</a></li>
    <li><a href="https://decapcms.org/">Decap CMS content management</a></li>
    <li><a href="https://pages.github.com/">GitHub Pages hosting</a></li>
  </ul>
</details>

<details>
  <summary>Analytics</summary>
  <ul>
    <li><a href="https://segment.com/">Segment third-party integrations</a></li>
    <li><a href="https://analytics.google.com">Google Analytics</a></li>
    <li><a href="https://aws.amazon.com/s3/">AWS S3 logs</a></li>
  </ul>
</details>

<details>
  <summary>Comments</summary>
  <ul>
    <li><a href="https://disqus.com/">Disqus comments</a></li>
  </ul>
</details>

calef maintains the access credentials for these resources.

<!-- Getting Started -->
## 	:toolbox: Getting Started

<!-- Run Locally -->
### :running: Run Locally

Clone the project

```bash
  git clone git@github.com:Interlake-Saints/ihsmemorial.org.git
```

Go to the project directory

```bash
  cd ihsmemorial.org
```

Install dependencies

```bash
  ./script/bootstrap
```

Start the server

```bash
  ./script/server
```

### :pen: How to author entries

Entries are in \_posts. Each field means as follows:

- title: The name of the person.
- date: The date of death in YYYY-MM-DD format.
- categories: Either the class in the form of "class-of-1974" or "staff". Can contain multiple values in cases where the person was both staff and student.
- tags: The causes of death. Use the tags in \_cause.
- images: A list of URLs to images. Ideally local images such as "/assets/241166_1771058511999_6511222_o.jpg"

You can create entries via <a href="https://ihsmemorial.org/admin">Decap CMS</a>.

<!-- License -->
## :warning: License

Distributed under the CC0 1.0 Universal License. See LICENSE for more information.
