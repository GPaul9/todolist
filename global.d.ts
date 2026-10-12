// SCSS & CSS Modules
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// CSS & SCSS
declare module '*.scss';
declare module '*.css';

// image
declare module '*.png' {
  const value: string;
  export default value;
}
declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module '*.jpeg' {
  const value: string;
  export default value;
}
declare module '*.gif' {
  const value: string;
  export default value;
}
declare module '*.svg' {
  const content: string;
  export default content;
}
