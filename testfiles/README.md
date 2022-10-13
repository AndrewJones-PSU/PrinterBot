# PrinterBot

PrinterBot is an application that takes print queries from users and prints them using a receipt printer. The
application was originally designed to interface through a discord bot, but it can be configured to accept POST requests
via a webserver for printing as well.

## Ok Cool, but Why?

I thought it would be funny, and it also seems like a fun project.

## Features

Here's a few things the application can do

-   Print messages or text files uploaded by discord users, with proper formatting
    -   MarkDown files and code blocks will be printed with proper headings, formatting, etc.
    -   Certain users can be whitelisted for printing, or everyone can be allowed to print
-   Hosts a webserver for uploading files through POST requests, allowing for external functionality to be implemented
