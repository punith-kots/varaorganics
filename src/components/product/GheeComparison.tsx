import Link from "next/link";
import type { ProductBatch } from "@/types";
import styles from "./GheeComparison.module.css";

const claims = [
  "100% Pure",
  "Natural Goodness",
  "Traditional Recipe",
  "Farm Fresh",
  "Trusted by Millions",
];

/** Reusable comparison; batch facts come from the same catalogue as the product. */
export function GheeComparison({ batch }: { batch: ProductBatch | null }) {
  const parameters = batch?.labParameters.slice(0, 5) ?? [];
  const hasReport = Boolean(batch?.labReportUrl);

  return (
    <section className={styles.wrap} aria-label="Ghee label and lab report comparison">
      <h2 className={styles.tagline}>
        <span>Most ghee brands ask you to trust the label. We give you the lab report.</span>
      </h2>
      <div className={styles.compare}>
        <div className={`${styles.panel} ${styles.left}`}>
          <h3>What most ghee labels say</h3>
          <ul className={styles.claims}>
            {claims.map((claim) => (
              <li key={claim}>{claim}</li>
            ))}
          </ul>
          <div className={`${styles.stamp} ${styles.unverified}`}>UNVERIFIED</div>
        </div>
        <span className={styles.vs} aria-hidden="true">
          vs
        </span>
        <div className={`${styles.panel} ${styles.right}`}>
          <div className={styles.brand}>
            <svg
              viewBox="0 0 22 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2 2l9 8 9-8" />
            </svg>
            Vara Organic
          </div>
          <h3>What we show you</h3>
          <div className={styles.report}>
            <h4>{batch ? `Current batch · ${batch.batchNumber}` : "Ghee laboratory documents"}</h4>
            {parameters.length > 0 ? (
              <dl>
                {parameters.map((parameter) => (
                  <div key={parameter.id} className={styles.row}>
                    <dt>{parameter.name}</dt>
                    <dd>{parameter.result}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={styles.pending}>
                View the available
                supporting laboratory documents below.
              </p>
            )}
            <Link className={styles.reportLink} href={batch?.labReportUrl || "/labreport/ghee"}>
              {hasReport ? "View batch lab report" : "View ghee lab documents"}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={`${styles.stamp} ${styles.proved}`}>
            {hasReport && parameters.length > 0 ? "PROVED" : "TRACEABLE"}
          </div>
        </div>
      </div>
    </section>
  );
}
