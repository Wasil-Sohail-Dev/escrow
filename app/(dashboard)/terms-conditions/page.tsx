"use client";

import React from "react";
import Topbar from "../components/Topbar";

const TermsConditionsPage = () => {
  return (
    <>
      <Topbar
        title="Terms & Conditions"
        description="Here is a list of all your Terms & Conditions"
      />
      <div className="mt-[85px]">
        <div className="max-w-7xl">
          <div className="mb-8">
            <h1 className="text-[22px] lg:text-[24px] font-bold text-[#292929] dark:text-dark-text">
              Terms and Conditions
            </h1>
          </div>

          <div className="space-y-8">
            {/* Explanation of Fees Section */}
            <div>
              <h2 className="text-[20.5px] font-bold text-[#333333] dark:text-dark-text mb-2 leading-[27.46px]">
                EXPLANATION OF FEES
              </h2>
              <p className="text-[20.5px] leading-[27.46px] font-normal text-[#333333]/80 dark:text-dark-text/80">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores et quas molestias excepturi sint occaecati cupiditate
                non provident, similique sunt in culpa qui officia deserunt
                mollitia animi, id est laborum et dolorum fuga. Et harum quidem
                rerum facilis est et expedita distinctio. Nam libero tempore,
                cum soluta nobis est eligendi optio cumque nihil impedit quo
                minus id quod maxime placeat facere possimus, omnis voluptas
                assumenda est, omnis dolor repellendus. Temporibus autem
                quibusdam et aut officiis debitis aut aut rerum.
              </p>
            </div>

            {/* Terms Section */}
            <div>
              <h2 className="text-[20.5px] font-bold text-[#333333] dark:text-dark-text mb-2 leading-[27.46px]">
                TERMS
              </h2>
              <p className="text-[20.5px] leading-[27.46px] font-normal text-[#333333]/80 dark:text-dark-text/80">
                At vero eos et accusamus et iusto odio dignissimos ducimus. Nam
                libero tempore, cum soluta nobis est eligendi optio cumque nihil
                impedit quo minus id quod maxime placeat facere assumenda est,
                omnis voluptas assumenda est, omnis dolor repellendus.
                Temporibus autem quibusdam et aut officiis debitis aut rerum
                necessitatibus saepe eveniet ut et voluptates repudiandae sint
                et molestiae non recusandae. Itaque earum rerum hic tenetur a
                sapiente delectus, ut aut reiciendis voluptatibus maiores alias
                consequatur aut perferendis doloribus asperiores repellat.
              </p>
            </div>

            {/* Promotions Section */}
            <div>
              <h2 className="text-[20.5px] font-bold text-[#333333] dark:text-dark-text mb-2 leading-[27.46px]">
                PROMOTIONS
              </h2>
              <p className="text-[20.5px] leading-[27.46px] font-normal text-[#333333]/80 dark:text-dark-text/80">
                LOREM IPSUM DOLOR IPSUM LOREM IPSUM LOREM IPSUM LOREM IPSUM
                LOREM IPSUM IPSUM LOREM IPSUM LOREM IPSUM
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsConditionsPage;
