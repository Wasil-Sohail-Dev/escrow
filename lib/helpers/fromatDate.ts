export const formatDate = (dateString: string, isTimeShow: boolean = true) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      // hour: isTimeShow ? '2-digit' : undefined,
      // minute: isTimeShow ? '2-digit' : undefined
    });
  };