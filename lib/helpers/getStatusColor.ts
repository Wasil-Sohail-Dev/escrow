export   const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-bg text-success-text";
      case "adminInactive":
      case "userInactive":
        return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      case "pendingVerification":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
        case "verified":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

export  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "fully_released":
        return "bg-success-bg text-success-text";
      case "processing":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "funded":
      case "partially_released":
        return "bg-primary-100 text-primary";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

export  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "resolved":
        return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      case "process":
        return "bg-primary-100 text-primary dark:bg-primary/20 dark:text-primary";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };