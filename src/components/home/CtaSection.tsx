/* eslint-disable @next/next/no-img-element -- original markup preserved for pixel parity */
export function CtaSection() {
  return (
    <section className="cta-section-main" aria-labelledby="ctaSectionMainTitle">
      <svg className="cta-section-main__swirl" viewBox="0 0 1920 459" aria-hidden="true" focusable="false">
        <path
          d="M864 -260C865 -230 867 -123 868 -80C869 -37 870 -27 871 0C872 27 873 53 875 80C877 107 880 133 884 160C888 187 894 213 902 240C910 267 917 293 929 320C941 347 958 375 976 400C994 425 1013 447 1040 470C1067 493 1098 521 1140 540C1182 559 1238 575 1290 585C1342 595 1402 600 1450 598C1498 596 1543 588 1580 572C1617 556 1648 529 1672 500C1696 471 1708 430 1722 400C1736 370 1748 340 1757 320C1766 300 1768 293 1773 280C1778 267 1782 260 1789 240C1796 220 1808 187 1817 160C1826 133 1834 107 1840 80C1846 53 1849 28 1852 0C1855 -28 1862 -57 1858 -90C1854 -123 1848 -171 1830 -200C1812 -229 1777 -259 1750 -262C1723 -265 1688 -245 1670 -220C1652 -195 1646 -147 1640 -110C1634 -73 1638 -32 1636 0C1634 32 1632 53 1631 80C1630 107 1631 140 1632 160C1633 180 1633 178 1636 200C1639 222 1643 260 1648 290C1653 320 1659 350 1668 380C1677 410 1695 455 1700 470"
          fill="none"
          stroke="#fbb584"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="container-fluid cta-section-main__container">
        <div className="row">
          <div className="col-12 col-lg-6">
            <div className="cta-section-main__heading" data-aos="fade-up">
              <h2 className="cta-section-main__title" id="ctaSectionMainTitle">
                Let’s make your brand stand out.
              </h2>
              <img className="cta-section-main__arrow" src="/assets/images/cta-arrow-large.svg" alt="" aria-hidden="true" width={90} height={90} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
