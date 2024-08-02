document.addEventListener("DOMContentLoaded", function () {
    const generateButton = document.getElementById("generatePassword");
    const copyButton = document.getElementById("copyPassword");
    const newPasswordButton = document.getElementById("newPassword");
    const passwordDisplay = document.getElementById("passwordDisplay");
  
    generateButton.addEventListener("click", function () {
      const passwordLength = parseInt(document.getElementById("length").value, 10);
      const includeUppercase = document.getElementById("includeUppercase").checked;
      const includeNumbers = document.getElementById("includeNumbers").checked;
      const includeSpecialChars = document.getElementById("includeSpecialChars").checked;
  
      const password = generatePassword(passwordLength, includeUppercase, includeNumbers, includeSpecialChars);
      passwordDisplay.textContent = password;
    });
  
    copyButton.addEventListener("click", function () {
      copyToClipboard(passwordDisplay.textContent);
    });
  
    newPasswordButton.addEventListener("click", function () {
      const passwordLength = parseInt(document.getElementById("length").value, 10);
      const includeUppercase = document.getElementById("includeUppercase").checked;
      const includeNumbers = document.getElementById("includeNumbers").checked;
      const includeSpecialChars = document.getElementById("includeSpecialChars").checked;
  
      const password = generatePassword(passwordLength, includeUppercase, includeNumbers, includeSpecialChars);
      passwordDisplay.textContent = password;
    });
  
    function generatePassword(length, useUppercase, useNumbers, useSpecialChars) {
      let charset = "abcdefghijklmnopqrstuvwxyz";
  
      if (useUppercase) {
        charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      }
  
      if (useNumbers) {
        charset += "0123456789";
      }
  
      if (useSpecialChars) {
        charset += "!@#$%^&*()_+";
      }
  
      let password = "";
      for (let i = 0; i < length; i++) {
        if (i === 15) {
          password += "..."; // Dodaj tačke nakon prvih 15 karaktera
          break; // Prekini petlju nakon dodavanja tačaka
        }
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
  
      return password;
    }
  
    function copyToClipboard(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  });
  