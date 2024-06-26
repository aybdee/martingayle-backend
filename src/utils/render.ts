import axios from "axios";

let RENDER_API_TOKEN = process.env.RENDER_API_KEY;
let RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;

export async function getNumberOfWorkerInstances() {
  try {
    const response = await axios.get(
      `https://api.render.com/v1/services/${RENDER_SERVICE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${RENDER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.serviceDetails.numInstances;
  } catch (error) {
    console.error("Error creating worker instance:", error);
  }
}

// Function to create a new instance of the worker
export async function createWorkerInstance() {
  try {
    let numInstances = await getNumberOfWorkerInstances();
    const response = await axios.post(
      `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/scale`,
      {
        numInstances: numInstances + 1,
      },
      {
        headers: {
          Authorization: `Bearer ${RENDER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("New worker instance created:", response.data);
  } catch (error) {
    console.error("Error creating worker instance:", error);
  }
}

export async function deleteWorkerInstance() {
  try {
    let numInstances = await getNumberOfWorkerInstances();
    const response = await axios.post(
      `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/scale`,
      {
        numInstances: numInstances - 1,
      },
      {
        headers: {
          Authorization: `Bearer ${RENDER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("New worker instance created:", response.data);
  } catch (error) {
    console.error("Error creating worker instance:", error);
  }
}

export async function intializeWorkers() {
  try {
    await axios.post(
      `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/resume`
    );
  } catch (err) {
    console.error("Error initializing workers:", err);
  }
}

export async function spinDownWorkers() {
  try {
    const response = await axios.post(
      `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/scale`,
      {
        numInstances: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${RENDER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    await axios.post(
      `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/suspend`
    );
  } catch (error) {
    console.error("Error spinning down worker instance:", error);
  }
}
