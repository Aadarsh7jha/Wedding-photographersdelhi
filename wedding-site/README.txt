XYZ Weddings - static website (HTML + CSS + JS)

index.html      -> saara content (text, links, prices, testimonials)
css/style.css   -> saari styling
js/main.js      -> menu, scroll animations, form
images/         -> saari photos

Chalane ke liye: index.html ko browser me double-click karo.

IMAGES: images/ me abhi PLACEHOLDER hain. Apni photos ko SAME filename se replace karo
(jaise story-royal.jpg, gallery-bride.jpg, hero-desktop-2000.webp). Sizes har placeholder par likhe hain.
Hero ke 6 webp (desktop 900/1400/2000, mobile 640/900/1200) alag-alag width me banane hain.

FORM: index.html me <form id="enquiry-form" data-endpoint=""> -
  data-endpoint khali ho to enquiry WhatsApp par jaati hai.
  Formspree jaisi service ka URL daalo to form direct submit hoga.
Phone / WhatsApp / email / address index.html me search-replace kar lo (+91 98765 43210, 919876543210, hello@xyzweddings.example).
