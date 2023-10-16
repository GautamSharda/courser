import {useState, useEffect} from 'react';

// const dummyData = {
//     plans: [
//       {courses: [ 
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//       ]},
//       {courses: [ 
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//       ]},
//       {courses: [ 
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//         {ID: "CS:2450", title: "Discrete Math", instructor: "elizabeth kleiman", time: "9 AM MWF"},
//       ]},
//     ],
//   }
  
//   const plan = {"type": "AI", "plans": dummyData.plans, "text": "", "startText": "We thought theses courses would fit well for you next semester", "endText": "Do you have any suggestions to this list" }
//setPlans([{"type": "AI", "plans": res.courses, "text": "", "startText": "We thought theses courses would fit well for you next semester", "endText": "Do you have any suggestions to this list" }]);

export function AIResponse({ response }) {

  const { subject, text, type, sources } = response;
  if (type == "AI") {
    return (
      <div className="flex flex-col rounded-br-xl rounded-tr-xl w-full md:w-[600px] bg-[#f0f0f0] py-2 px-4 mb-4">
        {text.split('\n').map((item, i) => (
          <p key={i} className='text-md'>
            {item}
            <br />
          </p>
        ))}
        <br />

        {sources.map((source, i) => (
          <p
            className="w-full overflow-hidden text-ellipsis whitespace-nowrap"
            key={i}
          >
            <strong>Source {source.number}:</strong>{' '}
            <u className="opacity-100 transition duration-200 hover:opacity-60">
            {source.type === "personal" ? (<a href={source.url} download={source.title}>{source.title}</a>) 
              : 
              (<a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>)}            
            </u>
          </p>
        ))}
      </div>
    )
  }
  return (
    <div className="humanAnswer">
      <p>{text}</p>
    </div>
  )
}



const PeopleList = ({ people }) => {
  return (
    <div className="w-[100%] min-w-15">
      <div className="mt-8 flow-root">
        <div className="-my-2 overflow-x-auto">
          <div className="inline-block min-w-full pb-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Course Title</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Instructor</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Times</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CourseID</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {people.map((person, i) => (
                  <tr className="even:bg-gray-50" key={i}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                      {person.title}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.instructor}  
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.time}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.ID}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeopleList;