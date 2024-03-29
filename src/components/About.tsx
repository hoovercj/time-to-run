import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <div>
      <p>
        Running a marathon is hard. Setting up your training plan shouldn't be. Save time on planning and give yourself more <span className={"primary"}><b>Time to Run</b></span>.
      </p>
      <ol>
        <li>Set the date of your race</li>
        <li>Pick a plan</li>
        <li>Choose miles or kilometers</li>
        <li>Download the plan and add it to your calendar</li>
      </ol>
      <p>It really is that easy. <Link to={"/"}>Get Started Now!</Link></p>
      <h2>Edit a Plan or Create Your Own</h2>
      <p>
        Choose the plan you want as a base (or the "New" plans if you want a
        blank slate) and then click the edit icon next to the title of the plan
        to begin editing, or press "alt+e". You can change the title,
        add and remove workouts with the icons or "alt+n" and "alt+d",
        and even reorder them to tailor the workout exactly how you want them
        by dragging on the "arrows" icon or pressing "alt+up" or "alt+down".
        To reorder workouts in edit mode, simply drag the "arrows" icon or use
        the keyboard shortcuts "alt+up arrow" or "alt+down arrow".
      </p>
      <p>
        <strong>Note:</strong> As you edit plans in the website, you'll see certain values underlined such as <u>8 miles</u> or <u>5km</u>.
        These underlines indicate values that can be translated back-and-forth between units so that anybody can use them.
      </p>
      <h2>Save Your Plan For Later</h2>
      <p>
        Once you've created a plan that you might want to use again in the
        future, or want to share with someone else, download the plan as a json
        or csv file so you can import the plan again the next time you need it!
      </p>
      <h2>Acknowledgements</h2>
      <p>
        This project takes inspiration from{" "}
        <a href="https://defy.org/hacks/calendarhack/about/">Calendar Hack</a>{" "}
        by <a href="https://twitter.com/defyorg">@defyorg</a> which I've already
        used for multiple marathons.
      </p>
      <p>
        This project includes a few popular training plans from{" "}
        <a href="https://www.amazon.com/gp/product/B07PPRH66H/ref=as_li_tl?ie=UTF8&tag=codyhoover-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B07PPRH66H&linkId=2d5713afeeff31d780b3522d13c240fd">
          Advanced Marathoning
        </a>{" "}
        by Pete Pfitzinger and Scott Douglas,{" "}
        <a href="https://www.amazon.com/gp/product/1450470459/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1450470459&linkCode=as2&tag=codyhoover-20&linkId=6107e4706a5e1cc10836339bd7b312e0">
          Faster Road Racing: 5K to Half Marathon
        </a>{" "}
        by Pete Pfitzinger and Philip Latter,{" "}
        <a href="https://www.amazon.com/gp/product/1937715485/ref=as_li_tl?ie=UTF8&tag=codyhoover-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=1937715485&linkId=f9fc64ec3ea36b0f6abbf4aeb66257f5">
          Hansons Marathon Method
        </a>{" "}
        by Kieth and Kevin Hanson, and{" "}
        <a href="https://www.amazon.com/gp/product/1609612248/ref=as_li_tl?ie=UTF8&tag=codyhoover-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=1609612248&linkId=026cfc4ad84ba7eddeb14093ab2d8689">
          Marathon: The Ultimate Training Guide
        </a>{" "}
        by Hal Higdon. The plans are not intended to be used on their own and
        should be used in combination with the books, so please support the
        authors (and yourself!) if you don't already own them.
      </p>
      <p>You will also find a version of the popular <a href="https://www.coachmag.co.uk/5k-training/3472/running-for-beginners-free-couch-to-5k-plan">Couch to 5k program</a></p>
      <p>
        Calendar Icon made by{" "}
        <a href="https://www.flaticon.com/authors/monkik">monkik</a> from{" "}
        <a href="https://www.flaticon.com">www.flaticon.com</a>.
      </p>
      <p>
        All other icons made by Font Awesome from{" "}
        <a href="https://www.fontawesome.com">www.fontawesome.com</a>.
      </p>
      <h2>Contact Me</h2>
      <p>If you have made a plan that you think others might benefit from or if you have issues, questions, or suggestions on how I can make this project work better for you, reach out via <a href="mailto:timetorun@codyhoover.com">email</a> or <a href="https://github.com/hoovercj/time-to-run/issues">on github</a>.</p>
    </div>
  );
}

export default About;
