// About page content configuration
// This file is optional - if you don't customize it, default content will be used

export const aboutContent = {
  pageTitle: 'About the Social Media Archive',
  sections: {
    website: {
      title: 'About the Website',
      paragraphs: [
        {
          text: "The aim of this website was to create a static, user-friendly site that serves as an archive explorer for <strong>Freifunk's</strong> historical twitter social media posts. It includes a simple interface to <strong>browse all tweets inverse chronologically</strong> (newest to oldest), and a <strong>search feature</strong> that lets you explore relevant tweets base on content and username. Lastly, it is designed to support additional social media archives in the future and is fully open source, allowing others to use this site as a template for their own archives."
        },
        {
          text: 'To view a technical breakdown of how this archive was built, please visit',
          link: {
            url: 'https://blog.freifunk.net/2025/08/04/sandra-taskovic-final-freifunk-social-media-archive-gsoc-2025/',
            text: ' the project blog post'
          }
        }
      ]
    },
    gsoc: {
      title: 'About GSoC 2025 and the Contributor',
      paragraphs: [
        {
          text: 'This project was developed by',
          link: {
            url: 'https://www.linkedin.com/in/sandrataskovic/',
            text: ' Sandra Taskovic'
          },
          textAfter: ' as part of her',
          link2: {
            url: 'https://summerofcode.withgoogle.com/',
            text: ' Google Summer of Code 2025'
          },
          textAfter2: ' contributor project. Over the summer of 2025, she spent approximately one hundred hours while working with a mentor from Freifunk to scope and build out the archive in several phases:'
        },
        {
          list: [
            'Static Site Generator (SSG) setup with Astro',
            'Data extraction tool for Twitter posts',
            'Static site mockup and design',
            'Client-side search implementation',
            'Customizable theming support',
            'Documentation and deployment',
            'Testing, optimizing, and ensuring scalability'
          ]
        },
        {
          text: "At the time of making this archive, <strong>Sandra Taskovic is a Honors Computing Science student </strong> finishing her undergraduate degree at the <strong>University of Alberta</strong>, in Canada. She has a passion for open source software and hopes this project will create a lasting positive impact for the Freifunk community."
        }
      ]
    },
    freifunk: {
      title: "About Freifunk's Support",
      paragraphs: [
        {
          text: '',
          link: {
            url: 'https://freifunk.net/en/',
            text: 'Freifunk'
          },
          textAfter: ' is a German-based open source initiative focused on building community-owned wireless networks. As a',
          link2: {
            url: 'https://summerofcode.withgoogle.com/programs/2025/organizations/freifunkmentoring',
            text: ' mentoring organization for GSoC'
          },
          textAfter2: ', Freifunk provided guidance, infrastructure, and support throughout the project.'
        },
        {
          text: 'A special thank you to',
          link: {
            url: 'https://github.com/andibraeu',
            text: ' Andreas Bräu'
          },
          textAfter: ', whose thoughtful feedback and encouragement made this project possible.'
        }
      ]
    },
    cyd: {
      title: 'About Cyd',
      paragraphs: [
        {
          text: '',
          link: {
            url: 'https://cyd.social/',
            text: 'Cyd'
          },
          textAfter: ' is a tool that helps users save a searchable copy of their social media data locally to their computer. In this case, we used Cyd to pull tweets into a SQLite3 database and then delete them from Twitter. We then used this database during the build process to run this website.'
        }
      ]
    }
  }
};

