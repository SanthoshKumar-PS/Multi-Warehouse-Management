import { toast } from "sonner";

export const handleApiError = (error: any) => {
  console.log("Error occured: ", error);
  if (error.response) {
    const { status, data } = error.response;
    const serverMessage = error.response.data?.message;
    if (status === 400) {
      toast.error(serverMessage || "Missing required fields.");
    } else if (status === 401) {
      toast.error(serverMessage || "Unauthorized access");
    } else if (status === 403) {
      toast.error(serverMessage || "Access Denied");
    } else if (status === 404) {
      toast.error(serverMessage || "User Data Not Found");
    } else if (status === 500) {
      toast.error("Internal Server Error .Please try again later.");
    } else {
      toast.error("Unexpected error occurred");
    }
    console.log(`Error ${status}: ${data?.message}`);
  } else {
    console.log("Error occured in home: ", error);
    toast.error("Network error. Please check your connection.");
  }
  console.error(error);
};
