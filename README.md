# About

Running a marathon is hard. Setting up your training plan shouldn't be.

1. Set the date of your race
2. Pick a plan
3. Choose miles or kilometers
4. Download the plan and add it to your calendar

It doesn't need to be any harder than that! And if you like one of the built-in plans, it really is that easy. Pick your plan and download an .ical file to import into Google calendar, your iphone calendar, or whatever app you use.

[Get started!](https://www.codyhoover.com/calendar-hack)

## Create your own plan

After importing a plan into your calendar program of choice, you can always go in and modify individual events to your liking. But if you want to make significant changes to a plan, or even make up your own to use later or to share with friends or clients, you can download the plan as a ".csv" file to edit in Excel or Notepad.

When editing the plans, there are only a few things you need to know.

1. Use the "#" symbol before values that should display in the selected units, and the letters "D" and "d" to show "long" or "short" units after the values.

   For example, if you have a plan written in miles, you can write a workout that automatically gets converted to kilometers like this:
    * Workout: : "Warmup #2D, 4x800m, Cooldown #2d"
    * Miles: "Warmup 2 miles, 4x800m, Cooldown 2mi"
    * Kilometers: "Warmup 3 kilometers, 4x800m, Cooldown 3km".


2. The letters "D" and "d" can be omitted or they can be used on their own:
    * "#5 without units, #D without a number" becomes
    * "5 without units, miles without a number"


3. The "totalDistance" column is used to calculate the weekly volume for the plan, so don't forget to fill it out!

If you'd like to start from scratch, download [this file](https://raw.githubusercontent.com/hoovercj/calendar-hack/master/src/workouts/template.csv) and edit it in Excel

## Acknowledgements

This project takes inspiration from ["Calendar Hack"](https://defy.org/hacks/calendarhack/about/) by [@defyorg](https://twitter.com/defyorg) which I've already used for multiple marathons.

This project includes a few popular training plans from [Advanced Marathoning](http://www.amazon.com/Advanced-Marathoning-Edition-Pete-Pfitzinger/dp/0736074600) by Pete Pfitzinger and Scott Douglas, [Hansons Marathon Method](https://hansons-running.com/collections/hansons-swag/products/hansons-method-hansons-method-mara%22) by Kieth and Kevin Hanson, and [Marathon: The Ultimate Training Guide](http://www.amazon.com/Marathon-Ultimate-Training-Programs-Marathons/dp/1609612248) by Hal Higdon. The plans are not intended to be used on their own and should be used in combination with the books.

Icon made by [monkik](https://www.flaticon.com/authors/monkik) from [www.flaticon.com](www.flaticon.com).

## Contact

If you have questions, comments, or issues, reach out via email (calendarhack at codyhoover dot com) or [on github](https://github.com/hoovercj/calendar-hack/issues).