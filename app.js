let machines = [];
let queueEntries = [];


// =========================
// GET MACHINES
// =========================

async function getMachines() {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/machines?select=*`,
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Machines error: ${response.status}`);
    }

    return await response.json();
}


// =========================
// GET QUEUE
// =========================

async function getQueue() {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/queue?select=*`,
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Queue error: ${response.status}`);
    }

    return await response.json();
}


// =========================
// LOAD DATA
// =========================

async function loadAppData() {

    try {

        machines = await getMachines();

        queueEntries = await getQueue();

        console.log("Machines:", machines);
        console.log("Queue:", queueEntries);

        renderMachines();

        updateStats();

        // Update My Queue section
        renderMyQueue();

    } catch (error) {

        console.error("Error:", error);

    }
}


// =========================
// RENDER MACHINES
// =========================

function renderMachines() {

    const container =
        document.getElementById("machinesContainer");

    if (!container) {
        console.error("machinesContainer not found");
        return;
    }

    container.innerHTML = "";

    machines.forEach(function(machine) {

        const machineQueue =
            queueEntries.filter(function(entry) {

                return entry.machine_id === machine.id;

            });

        const isAvailable =
            machine.status === "available";

        const card =
            document.createElement("div");

        card.className =
            "machine-card";

        card.innerHTML = `

            <div class="machine-top">

                <h3 class="machine-name">
                    ${machine.name}
                </h3>

                <span class="status-badge ${
                    isAvailable
                        ? "status-available"
                        : "status-running"
                }">

                    ${
                        isAvailable
                            ? "Available"
                            : "Running"
                    }

                </span>

            </div>


            <div class="machine-info">

                <div class="info-box">

                    <span>Status</span>

                    <strong>
                        ${
                            isAvailable
                                ? "Ready to use"
                                : "Currently running"
                        }
                    </strong>

                </div>


                <div class="info-box">

                    <span>People waiting</span>

                    <strong>
                        ${machineQueue.length}
                    </strong>

                </div>

            </div>


            <button

                class="machine-button"

                onclick="${
                    isAvailable
                        ? `useMachine(${machine.id})`
                        : `joinQueue(${machine.id})`
                }"

            >

                ${
                    isAvailable
                        ? "Use Now"
                        : "Join Queue"
                }

            </button>

        `;

        container.appendChild(card);

    });

}


// =========================
// UPDATE STATISTICS
// =========================

function updateStats() {

    const available =
        machines.filter(function(machine) {

            return machine.status === "available";

        }).length;


    const running =
        machines.filter(function(machine) {

            return machine.status === "running";

        }).length;


    document.getElementById(
        "availableCount"
    ).textContent = available;


    document.getElementById(
        "runningCount"
    ).textContent = running;


    document.getElementById(
        "waitingCount"
    ).textContent = queueEntries.length;

}


// =========================
// USE MACHINE
// =========================

function useMachine(machineId) {

    const machine =
        machines.find(function(machine) {

            return machine.id === machineId;

        });

    if (machine) {

        alert(
            machine.name +
            " is available!"
        );

    }

}


// =========================
// JOIN QUEUE
// =========================

async function joinQueue(machineId) {

    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/queue`,
                {
                    method: "POST",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "return=representation"

                    },

                    body: JSON.stringify({

                        machine_id:
                            machineId

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Queue insert error: ${response.status}`
            );

        }


        // Get the newly created queue entry

        const newQueue =
            await response.json();


        // Save its ID so My Queue
        // knows which entry belongs to this browser

        if (
            newQueue &&
            newQueue.length > 0
        ) {

            localStorage.setItem(
                "quickLaundryQueueId",
                newQueue[0].id
            );

        }


        alert(
            "You joined the queue!"
        );


        // Reload data from Supabase

        await loadAppData();


    } catch (error) {

        console.error(error);

        alert(
            "Could not join queue. Check the Console."
        );

    }

}


// =========================
// MY QUEUE
// =========================

function renderMyQueue() {

    const queueStatus =
        document.getElementById("queueStatus");


    if (!queueStatus) {
        return;
    }


    // Get the queue entry created
    // by this browser

    const savedQueueId =
        localStorage.getItem(
            "quickLaundryQueueId"
        );


    // No queue yet

    if (!savedQueueId) {

        queueStatus.innerHTML = `

            <p class="empty-queue">
                You haven't joined a queue yet.
            </p>

        `;

        return;

    }


    // Find the user's queue entry

    const myQueue =
        queueEntries.find(function(entry) {

            return String(entry.id) ===
                String(savedQueueId);

        });


    // If the queue entry cannot
    // be found in Supabase

    if (!myQueue) {

        queueStatus.innerHTML = `

            <p class="empty-queue">
                You haven't joined a queue yet.
            </p>

        `;

        return;

    }


    // Find the machine

    const machine =
        machines.find(function(machine) {

            return machine.id ===
                myQueue.machine_id;

        });


    const machineName =
        machine
            ? machine.name
            : "Unknown Machine";


    // Get queue entries for
    // the same machine

    const machineQueue =
        queueEntries
            .filter(function(entry) {

                return entry.machine_id ===
                    myQueue.machine_id;

            })
            .sort(function(a, b) {

                return new Date(a.joined_at) -
                       new Date(b.joined_at);

            });


    // Find current position

    const position =
        machineQueue.findIndex(
            function(entry) {

                return entry.id ===
                    myQueue.id;

            }
        ) + 1;


    // Show the current data
    // in the existing My Queue section

    queueStatus.innerHTML = `

        <div>

            <h3>
                You're in the queue!
            </h3>

            <p>
                ${machineName}
            </p>

            <p>
                Your current position:
                <strong>#${position}</strong>
            </p>

            <p>
                People waiting:
                <strong>${machineQueue.length}</strong>
            </p>

        </div>

    `;

}


// =========================
// START APP
// =========================

loadAppData();