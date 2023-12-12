import React from "react";

export default function Home() {
  return (
    <div className="relative w-full my-5 font-black text-center">
      <p style={{ fontSize: "6vw" }}>
        CHOI DOHYUN COMMUNITY
      </p>
      <div className="relative overflow-hidden rounded-2xl">
        <img src="/woo.jpg" alt="Woo" className="w-full h-auto" />
        <p
          className="absolute bottom-0 m-4 text-4xl font-bold text-center text-white"
          style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
        >
          우정서
        </p>
      </div>
    </div>
  );
}
