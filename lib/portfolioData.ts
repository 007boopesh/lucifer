export type PortfolioData = {
    hero: {
      name: string;
      location: string;
      role: string;
      description: string;
      currentFocus: string;
    };
  };
  
  export const PORTFOLIO_STORAGE_KEY = "boopesh-portfolio-data";
  
  export const defaultPortfolioData: PortfolioData = {
    hero: {
      name: "BOOPESH K",
      location: "India ",
      role: "Electronics & Communication Engineer",
      description:
        "Electronics & Communication Engineer blending Embedded Systems, IoT, PCB Design, Robotics and Communication Technologies with Video Editing and Graphic Design to create innovative solutions.",
      currentFocus: "Embedded + IoT",
    },
  };