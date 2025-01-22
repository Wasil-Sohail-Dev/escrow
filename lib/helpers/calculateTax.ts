   export function calculateTax(amount: number, type: "services" | "products"): number {
    let percentage = 0;
  
    if (type === "services") {
      if (amount <= 1000) percentage = 4;
      else if (amount <= 2500) percentage = 3.7;
      else if (amount <= 5000) percentage = 3.3;
      else percentage = 3;
    } else if (type === "products") {
      if (amount <= 100) percentage = 10;
      else if (amount <= 250) percentage = 8;
      else if (amount <= 500) percentage = 6.5;
      else percentage = 5;
    }
  
    return (amount * percentage) / 100; // Calculate the tax amount
  }
  