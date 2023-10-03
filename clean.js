let data = [
    {"id": 42980000024018800,"uuid": "FAFZfaaFvLVqcFMdtfrbwj5mYA4tvo2RVgrB6C42","folder_id": 42980000002633896,"display_name": "lec5-metrics.pdf","filename": "lec5-metrics.pdf","upload_status": "success","content-type": "application/pdf","url": "https://canvas.instructure.com/files/4298~24018798/download?download_frd=1&verifier=FAFZfaaFvLVqcFMdtfrbwj5mYA4tvo2RVgrB6C42","size": 606129,"created_at": "2023-09-05T21:54:21Z","updated_at": "2023-09-05T22:03:27Z","unlock_at": null,"locked": false,"hidden": false,"lock_at": null,"hidden_for_user": false,"thumbnail_url": null,"modified_at": "2023-09-05T21:54:21Z","mime_class": "pdf","media_entry_id": null,"category": "uncategorized","locked_for_user": false,"visibility_level": "inherit","summary": "Summary","course_code": "CS:2210:0AAA Fall20","course_name": "CS:2210:0AAA Fall20 Discrete Structures"}
]

const filteredData = data.map(item => ({
    display_name: item.display_name,
    created_at: item.created_at,
    summary: item.summary,
    course_name: item.course_name
}));

console.log(JSON.stringify(filteredData));