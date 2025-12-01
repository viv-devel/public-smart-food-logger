export const getHeaderColor = (environment?: string) => {
  switch (environment) {
    case "PROD":
      return "bg-gray-800";
    case "staging":
      return "bg-yellow-700";
    case "preview":
      return "bg-purple-700";
    case "ci-test":
      return "bg-green-700";
    case "local":
      return "bg-blue-700";
    default:
      return "bg-red-700"; // Default color (e.g. for unknown env)
  }
};
