import './form-skeleton.scss';

export default function FormSkeleton() {
  return (
    <div className="skeleton-row">
        <div className="skeleton-field">
          <div className="skeleton-box skeleton-label" />
          <div className="skeleton-box skeleton-input" />
        </div>
        <div className="skeleton-field">
          <div className="skeleton-box skeleton-label" style={{ width: '45%' }} />
          <div className="skeleton-box skeleton-input" />
        </div>
      </div>
  );
}
