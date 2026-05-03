import { Thread } from "@/stores/threadStore";


type ThreadResponse = {
  threads: Thread[];
  redirectThreadId: string | null;
};

export const getAllThreadsByUserId = async ({
  userId,
}: {
  userId: string;
}): Promise<ThreadResponse> => {
  try {
    const res = await fetch(`/api/mongo/threads?userId=${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch threads (${res.status})`);
    }

    const data = await res.json();

    return {
      threads: Array.isArray(data?.threads) ? data.threads : [],
      redirectThreadId: data?.redirectThreadId ?? null,
    };
  } catch (error) {
    console.error("getAllThreadsByUserId:", error);

    return {
      threads: [],
      redirectThreadId: null,
    };
  }
};
export const createThread = async ({
  userId,
}: {
  userId: string;
}): Promise<Thread | object> => {
  try {
    const res = await fetch(`/api/mongo/threads`, {
      method: 'POST',
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create thread (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error("createThread:", error);
    return {};
  }
};

export const updateThreadTitle = async ({
  threadId,
  userId,
  title,
}: {
  threadId: string;
  userId: string;
  title: string;
}): Promise<any> => {
  try {
    const res = await fetch(`/api/mongo/threads`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threadId, userId, title }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update thread title (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error("updateThreadTitle:", error);
    throw error;
  }
};

export const deleteThread = async ({
  threadId,
  userId,
}: {
  threadId: string;
  userId: string;
}): Promise<any> => {
  try {
    const res = await fetch(`/api/mongo/threads`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threadId, userId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to delete thread (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error("deleteThread:", error);
    throw error;
  }
};