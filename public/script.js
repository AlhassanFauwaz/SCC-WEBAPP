/*document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const query = document.getElementById('query').value.trim();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Searching...';

    try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!data.success) {
            resultsDiv.innerHTML = `<p>${data.error}</p>`;
            return;
        }
        // Render results using a simple template
        resultsDiv.innerHTML = data.data.map(caseItem => `
            <div class="case-result">
                <h3>${caseItem.title}</h3>
                <p><strong>Date:</strong> ${caseItem.date}</p>
                <p><strong>Citation:</strong> ${caseItem.citation}</p>
                <p><strong>Judges:</strong> ${caseItem.judges}</p>
                <p>${caseItem.description}</p>
            </div>
        `).join('');
    } catch (err) {
        resultsDiv.innerHTML = '<p>Error fetching results.</p>';
    }
});*/