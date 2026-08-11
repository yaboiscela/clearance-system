export default function Result({result}) {

    return (
        <div className="grid grid-cols-[1fr_2fr_1fr] text-center text-lg *:px-2 *:py-[9px] ">
            <h1>{result.stud_no}</h1>
            <h2>{result.first_name} {result.last_name}</h2>
            <p>{result.course}</p>
        </div>
    )
}