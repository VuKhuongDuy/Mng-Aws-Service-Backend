module.exports = {
  root: true,
  env: {
    node: true
  },
//   extends: ["eslint:recommended", "airbnb-base"],
  rules: {
    "one-var-declaration-per-line": [2, "always"],
    // "block-scoped-var": 1,  // var khai báo bên trong 1 scope và sử dụng ở bên ngoài  
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-duplicate-case": "warn", 
    "no-empty": ["error", { "allowEmptyCatch": true }],
    "keyword-spacing": ["error", { "before": true }], // bắt lỗi key ko có dấu cách so với các đấu { }
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
};

// "no-await-in-loop": "warn",  
// "newline-before-return": "error",  // newline trước khi return 

//plugin : mở rộng hoạt động cho eslinet

// extends: thêm những config của riêng mình vào 

// parserOptions : kiể1m tra cú pháp es5 mặc định, 