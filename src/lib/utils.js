import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

export function formatPrice(amount) {
  return formatCurrency(amount);
}

export function calculateGST(amount, rate = 0.18) {
  return amount * rate;
}

export function calculateShipping(subtotal, freeShippingThreshold = 500, shippingCost = 50) {
  return subtotal >= freeShippingThreshold ? 0 : shippingCost;
}

export function calculateTotal(subtotal, shipping = 0, tax = 0) {
  return subtotal + shipping + tax;
}

export function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^[\+]?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validatePincode(pincode) {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

export function getOrderStatus(status) {
  const statusMap = {
    pending: { text: 'Pending', color: 'orange' },
    confirmed: { text: 'Confirmed', color: 'green' },
    shipped: { text: 'Shipped', color: 'blue' },
    delivered: { text: 'Delivered', color: 'green' },
    cancelled: { text: 'Cancelled', color: 'red' }
  };
  
  return statusMap[status] || { text: 'Unknown', color: 'gray' };
}
