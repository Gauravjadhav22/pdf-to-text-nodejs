let str =
  `अर्दात फाड़ के रात\n\n \n\nकप शर दाद का दानव के हावादद अफाद धाजवजसा प्रकाशन की तिथि  क्र० निर्वाचक का नाम पिता माता पति पता साधारणतया निवास का स्थान  योग्यता पेशा अहता पुरुष विर्वाचक जी निर्वाचक\n\nसं० का नाम तिथि महिला ईपिक संख्या का फोटो\nको उम्र अन्य  यदि हो १     ५ ॥ शहर गांव सिनवाहिनी स्ट्रीट एरिया सिनवाहि  अंकित राज गगनदेव साह थाना सोनवरसा डाकघर सिनवाहिनी ख्रातक कृषि  पुरूष\n\nब्लॉक सिनवाहिनी ज़िला सीतामढ़ी\n\n \n\nशहर गांव दोस्तिया स्ट्रीट एरिया वार्ड  अखिलेश प्रसाद राम एकवाल महतो थाना भुतही डाकघर अररिया ल्लातकोत्तर टीचर  पुरूष\n\nब्लॉक ॥॥ ४४॥२ ज़िला सीतामढ़ी\n\n \n\nशहर गांव भटही स्ट्रीट एरिया भुतही अखिलेखर कुमार चौशारिदाधर प्रसाद चौशारी थाना सोनवरसा डाकघर भुतही ब्लॉक सोनवरस लितक प्रिवेट जॉब  पुरूष\n\nज़िला सीतामढ़ी\n\n \n\nशहर गांव बरिरारपुर स्ट्रीट एरिया बरिरारपुर  अंगिता कुमारी मुकेश कुमार थाना २ डाकघर ररिआ  लातक गृहिणी  महिला\n\nब्लॉक ॥ २ ज़िला सीतामढ़ी\n\n \n\n \n\nशहर गांव अररिया स्ट्रीट एरिया अररिया अंचल कुमारी रंजीत कुमार ख्रातक गृहिणी  महिला\n\nब्लॉक सोनबरसा ज़िला सीतामढ़ी\n\n \n\nशहर गांव बंदरझूला स्ट्रीट एरिया वार्ड न रत अंजू कुमारी राकेश रंजन कुमार थाना सोनवरसा डाकघर बंदरझूला ख्रातक गृहिणी  महिला\n\n \n\nब्लॉक सोनवरसा ज़िला सीतामढ़ी\n\n \n\nशहर गांव ।`;

  function extractHindiText(text) {
    const hindiTextRegex = /[\u0900-\u097F\s]+/g; // Match Hindi characters and spaces
    const matches = text.match(hindiTextRegex);
    return matches ? matches.map(chunk => chunk.trim()).join(' ') : '';
  }

let str2=str.split("क्र०")[1].replace('सं०','')
console.log(extractHindiText(str2));