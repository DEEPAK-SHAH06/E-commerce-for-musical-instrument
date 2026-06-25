// src/context/LanguageContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    hotDeals: 'Hot Deals',
    helpSupport: 'Help & Support',
    currencySymbol: 'Rs. ',
    languageLabel: 'EN | NPR',
    categories: 'Categories',
    searchPlaceholder: 'What are you looking for?',
    cart: 'Cart',
    signIn: 'Sign In',
    account: 'Account',
    myOrders: 'My Orders',
    accountSettings: 'Account Settings',
    signOut: 'Sign Out',
    shoppingCart: 'Shopping Cart',
    product: 'Product',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    action: 'Action',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'FREE',
    checkout: 'Checkout',
    continueShopping: 'Continue Shopping',
    browseInstruments: 'Browse Instruments',
    emptyCart: 'Your cart is empty',
    shopNow: 'Shop Now',
    newArrivals: 'New Arrivals',
    featuredProducts: 'Featured Products',
    addToCart: 'Add to Cart',
    viewDetails: 'View Details',
    allProducts: 'All Products',
    orderPlacedSuccess: 'Order placed successfully! Thank you for your purchase.',
    pleaseLoginCheckout: 'Please login to continue to checkout',
    selectPaymentMethod: 'Select Payment Method',
    paymentDescription: 'Please choose how you would like to pay for your order. All transactions are secure and encrypted.',
    payPlaceOrder: 'Pay & Place Order',
    cashOnDelivery: 'Cash on Delivery (COD)',
    esewa: 'eSewa Mobile Wallet',
    khalti: 'Khalti Digital Wallet',
    bankTransfer: 'Direct Bank Transfer',
    paymentSuccessMsg: 'Payment successful! Your order has been registered in our system.',
    ticketSuccess: 'Support ticket submitted successfully! We will get back to you shortly.',
    fullName: 'Full Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    submit: 'Submit Support Ticket',
    contactUs: 'Contact Us',
    frequentlyAskedQuestions: 'Frequently Asked Questions',
    hotDealsTitle: 'Hot Deals of the Day',
    dealTimer: 'Deals end in:',
    offPercent: 'OFF',
    nepalStore: 'Nepal\'s Premier Music Store',
    premiumInstruments: 'MusicStore ©2026 Premium Musical Instruments. All Rights Reserved.'
  },
  ne: {
    hotDeals: 'तातो डिलहरू',
    helpSupport: 'मद्दत र समर्थन',
    currencySymbol: 'रू. ',
    languageLabel: 'ने | रू',
    categories: 'वरिकरणहरू',
    searchPlaceholder: 'तपाईं के खोज्दै हुनुहुन्छ?',
    cart: 'कार्ट',
    signIn: 'साइन इन',
    account: 'मेरो खाता',
    myOrders: 'मेरो अर्डरहरू',
    accountSettings: 'खाता सेटिङहरू',
    signOut: 'साइन आउट',
    shoppingCart: 'शपिङ कार्ट',
    product: 'उत्पादन',
    price: 'मूल्य',
    quantity: 'मात्रा',
    total: 'जम्मा',
    action: 'कार्य',
    orderSummary: 'अर्डर सारांश',
    subtotal: 'उप-जम्मा',
    shipping: 'ढुवानी',
    free: 'नि:शुल्क',
    checkout: 'चेकआउट',
    continueShopping: 'खरिद जारी राख्नुहोस्',
    browseInstruments: 'बाजा खोज्नुहोस्',
    emptyCart: 'तपाईंको कार्ट खाली छ',
    shopNow: 'अहिले नै किन्नुहोस्',
    newArrivals: 'नयाँ सामानहरू',
    featuredProducts: 'विशेष उत्पादनहरू',
    addToCart: 'कार्टमा थप्नुहोस्',
    viewDetails: 'विवरण हेर्नुहोस्',
    allProducts: 'सबै उत्पादनहरू',
    orderPlacedSuccess: 'अर्डर सफलतापूर्वक दर्ता भयो! तपाईंको खरिदको लागि धन्यवाद।',
    pleaseLoginCheckout: 'कृपया चेकआउटमा जानका लागि लगइन गर्नुहोस्',
    selectPaymentMethod: 'भुक्तानी विधि छनौट गर्नुहोस्',
    paymentDescription: 'कृपया आफ्नो अर्डरको भुक्तानी विधि छनौट गर्नुहोस्। सबै कारोबार सुरक्षित र गुप्तिकरण गरिएका छन्।',
    payPlaceOrder: 'भुक्तानी गर्नुहोस् र अर्डर गर्नुहोस्',
    cashOnDelivery: 'डेलिभरीमा नगद भुक्तानी (COD)',
    esewa: 'ईसेवा मोबाइल वालेट (eSewa)',
    khalti: 'खल्ती डिजिटल वालेट (Khalti)',
    bankTransfer: 'बैंक स्थानान्तरण',
    paymentSuccessMsg: 'भुक्तानी सफल भयो! तपाईंको अर्डर प्रणालीमा दर्ता भएको छ।',
    ticketSuccess: 'मद्दत टिकट सफलतापूर्वक बुझाइयो! हामी चाँडै तपाईंसँग सम्पर्क गर्नेछौं।',
    fullName: 'पूरा नाम',
    email: 'इमेल',
    subject: 'विषय',
    message: 'सन्देश',
    submit: 'टिकट बुझाउनुहोस्',
    contactUs: 'हामीलाई सम्पर्क गर्नुहोस्',
    frequentlyAskedQuestions: 'बारम्बार सोधिने प्रश्नहरू (FAQ)',
    hotDealsTitle: 'आजको तातो डिलहरू',
    dealTimer: 'अफर समाप्त हुन बाँकी समय:',
    offPercent: 'छुट',
    nepalStore: 'नेपालको अग्रणी म्यूजिक स्टोर',
    premiumInstruments: 'म्यूजिकस्टोर ©२०२६ प्रिमियम वाद्ययन्त्रहरू। सर्वाधिकार सुरक्षित।'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ne')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ne') {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
