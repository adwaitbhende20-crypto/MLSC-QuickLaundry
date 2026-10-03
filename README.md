The annoyance
Hostel students often waste time going to the laundry room only to find that all machines are occupied.
QuickLaundry helps students check machine status and see the queue before going to the laundry room.
The problem was based on the common hostel laundry experience and the need to avoid unnecessary waiting.
My constraint
My PRN ends in 6, so the required constraint was Featherweight.
The first load must be under 150 KB transferred.
Because of this, I used plain HTML, CSS and JavaScript instead of heavier frameworks and libraries.
The great part
I focused on the live laundry queue.
Students can see machine availability, join a queue for a running machine, and see their current queue position.
I chose this because reducing unnecessary waiting is the main purpose of the app.
The two testers
I tested the app with two people.
They initially needed clearer feedback after joining a queue.
I changed the My Queue section to reflect the machine, current queue position, and number of people waiting.
AI
I used AI to help with the initial project structure, JavaScript logic, Supabase integration, debugging, and UI improvements.
One issue was that the first queue implementation did not properly update the My Queue section after joining.
I fixed it by fetching the latest queue data and rendering the My Queue section again.
Not done
User authentication is not implemented.
The queue currently identifies the user's queue entry using browser localStorage.
Some machine actions are currently prototype-level rather than connected to physical washing machines.
Run it locally
Clone/download the repository.
Open the project folder in VS Code.
Start a local server:
python -m http.server 5500
Open:
http://localhost:5500
Configuration

The project uses these configuration variable names:

SUPABASE_URL
SUPABASE_KEY