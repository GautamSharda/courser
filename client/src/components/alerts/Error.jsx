import { XCircleIcon } from '@heroicons/react/20/solid'

export default function Error({ mainText, subPoints, additionalClasses}) {
    const parentClass = 'rounded-md bg-red-50 p-4 w-full' + (additionalClasses ? ' ' + additionalClasses : '')
  return (
    <div className={parentClass}>
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{mainText}</h3>
          {subPoints && subPoints.length > 0 &&
            <div className="mt-2 text-sm text-red-700">
              <ul role="list" className="list-disc space-y-1 pl-5">
                {
                  subPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))
                }
              </ul>
            </div>}
          {/* <div className="mt-2 text-sm text-red-700">
            <ul role="list" className="list-disc space-y-1 pl-5">
              <li>Your password must be at least 8 characters</li>
              <li>Your password must include at least one pro wrestling finishing move</li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  )
}