const chartQueue = [];
const timeChartQueue = [];
// 改善 chart.js 解析度
window.devicePixelRatio = 3;
errorReloadText = '發生錯誤，請重新整理此頁面😥';

getActivity();
setInterval(drawChart, 500);
setInterval(drawTimeChart, 500);

function showActivity(resp) {
    const data = resp.data.data;
    const $table = $('#table');
    $table.bootstrapTable({
        data: data,
    });
}
async function getActivity() {
    try {
        await axios.post('/activities/getActivities').then(showActivity);
    } catch (error) {
        alert(errorReloadText);
    }
}

async function editActivity(id) {
    try {
        await axios.post('/activities/getActivity', { _id: id }).then((resp) => {
            data = resp.data;
            console.log(data);
            if ($(`#modal-${id}`)[0] != undefined) {
                modal = $(`#modal-${id}`).remove();
            }
            // pre-config
            modal = $('#modal').clone();
            modal[0].id = `modal-${id}`;
            modal.find('#modalTitle')[0].id = `modalTitle-${id}`;
            modal.find(`#modalTitle-${id}`)[0].innerHTML = `編輯：${data.name}`;
            modal.find('#modalBody')[0].innerHTML = "";
            modal.find('#modalBody')[0].id = `modalBody-${id}`;
            modal.insertAfter($('#modal'));

            // edit name
            $('<input />', { value: data.name });
            name_input = $('<input />', { id: `${id}-name`, value: data.name });
            name_label = $('<label>').text('活動名稱: ');
            name_input.appendTo(name_label);
            modal.find(`#modalBody-${id}`).append(name_label);
            modal.find(`#modalBody-${id}`).append($('<br />'));

            // time format info
            info = $('<p>', { text: '時間格式範例：2020-06-04T04:00:00.000Z，需注意這是 GMT+0 時間，也就是台灣時間 2020/06/04 中午 12 點整，請自行換算。' });
            modal.find(`#modalBody-${id}`).append($('<br />'));
            modal.find(`#modalBody-${id}`).append(info);

            // edit time
            open_from_label = $('<label>').text('開放時間: ');
            $('<input />', { id: `${id}-open-from`, value: data.open_from }).appendTo(open_from_label);
            modal.find(`#modalBody-${id}`).append(open_from_label);
            modal.find(`#modalBody-${id}`).append($('<br />'));
            open_to_label = $('<label>').text('結束時間: ');
            $('<input />', { id: `${id}-open-to`, value: data.open_to }).appendTo(open_to_label);
            modal.find(`#modalBody-${id}`).append(open_to_label);
            modal.find(`#modalBody-${id}`).append($('<br />'));

            // save button
            save_btn = $('<button />', { class: 'btn btn-sm btn-info', text: 'save' }).click(() => { updateActivity(id) });
            modal.find(`#modalBody-${id}`).append($(save_btn));
            // add edit candidate data
            edit_candidates = $('<button />', { class: 'btn btn-link pull-right', text: '編輯候選人' }).click(() => { editCandidate(id, modal) });
            modal.find(`#modalBody-${id}`).append(edit_candidates);


            // trigger modal
            $(`#modal-${id}`).modal();
        });
    } catch (error) {
        alert(errorReloadText);
        console.log(error);
    }
}

async function editCandidate(activity_id, previous_modal) {
    let id = `candidate-${activity_id}`;
    // close previous modal
    previous_modal.modal('toggle');
    console.log(activity_id);
    try {
        await axios.post('/options/getOptions', { filter: { activity_id } }).then((resp) => {
            data = resp.data.data;
            console.log(data);
            if ($(`#modal-${id}`)[0] != undefined) {
                modal = $(`#modal-${id}`).remove();
            }
            // pre-config
            modal = $('#modal').clone();
            modal[0].id = `modal-${id}`;
            modal.find('#modalTitle')[0].id = `modalTitle-${id}`;
            modal.find(`#modalTitle-${id}`)[0].innerHTML = `編輯候選人`;
            modal.find('#modalBody')[0].innerHTML = "";
            modal.find('#modalBody')[0].id = `modalBody-${id}`;
            modal.insertAfter($('#modal'));

            accordion = $('<div />', { class: 'accordion', id: `accordion-${id}` });
            modal.find(`#modalBody-${id}`).append(accordion);

            data.forEach((candidate, index) => {
                candidate_info = candidate.candidate;
                card = $('<div />', { class: 'card' });
                accordion.append(card);

                cardHeader = $('<div />', { class: 'card-header', id: `${id}-heading-${index}` });
                card.append(cardHeader);
                headerBtn = $('<button />', { class: 'btn btn-link btn-block', text: candidate_info.name });
                headerBtn.attr('data-toggle', 'collapse');
                headerBtn.attr('data-target', `#${id}-collapse-${index}`);
                headerBtn.attr('aria-expanded', 'false');
                headerBtn.attr('aria-controls', `${id}-collapse-${index}`);
                cardHeader.append(headerBtn);

                cardCollapse = $('<div />', { class: 'collapse', id: `${id}-collapse-${index}` });
                cardCollapse.attr('aria-labelledby', `${id}-heading-${index}`);
                cardCollapse.attr('data-parent', `#accordion-${id}`);
                card.append(cardCollapse);

                cardBody = $('<div />', { class: 'card-body' });
                cardCollapse.append(cardBody);

                console.log(candidate);
                // 姓名
                cardBody.append($('<p>', { text: `候選人：${candidate_info.name}` }));
                // 系級
                dept = $('<label>', { text: '系級：' });
                cardBody.append(dept);
                $('<input>', { value: candidate_info.department }).appendTo(dept);
                cardBody.append($('<br />'));
                // 學院
                college = $('<label>', { text: '學院' });
                cardBody.append(college);
                $('<input>', { value: candidate_info.college }).appendTo(college);
                cardBody.append($('<br />'));
            })

            // trigger modal
            $(`#modal-${id}`).modal();
        });
    } catch (error) {
        alert(errorReloadText);
    }
}

async function updateActivity(id) {
    try {
        _id = id;
        name = $(`#${id}-name`)[0].value;
        open_from = $(`#${id}-open-from`)[0].value;
        open_to = $(`#${id}-open-to`)[0].value;
        await axios.post('/activities/modifyActivity', { _id, name, open_from, open_to }).then((resp) => {
            if (resp.data.success) {
                $('#table').bootstrapTable('destroy');
                getActivity();
            }
        });
    } catch (error) {
        alert(errorReloadText);
    }
}

function newActivity() {
    id = 'addActivity';

    if ($(`#modal-${id}`)[0] != undefined) {
        modal = $(`#modal-${id}`).remove();
    }

    // pre-config
    modal = $('#modal').clone();
    modal[0].id = `modal-${id}`;
    modal.find('#modalTitle')[0].id = `modalTitle-${id}`;
    modal.find(`#modalTitle-${id}`)[0].innerHTML = `新增活動`;
    modal.find('#modalBody')[0].innerHTML = "";
    modal.find('#modalBody')[0].id = `modalBody-${id}`;
    modal.insertAfter($('#modal'));

    // edit name
    $('<input />');
    name_input = $('<input />', { id: `${id}-name` });
    name_label = $('<label>').text('活動名稱: ');
    name_input.appendTo(name_label);
    modal.find(`#modalBody-${id}`).append(name_label);
    modal.find(`#modalBody-${id}`).append($('<br />'));

    // time format info
    info = $('<p>', { text: '時間格式範例：2020-06-04T04:00:00.000Z，需注意這是 GMT+0 時間，也就是台灣時間 2020/06/04 中午 12 點整，請自行換算。' });
    modal.find(`#modalBody-${id}`).append($('<br />'));
    modal.find(`#modalBody-${id}`).append(info);

    // edit time
    open_from_label = $('<label>').text('開放時間: ');
    $('<input />', { id: `${id}-open-from` }).appendTo(open_from_label);
    modal.find(`#modalBody-${id}`).append(open_from_label);
    modal.find(`#modalBody-${id}`).append($('<br />'));
    open_to_label = $('<label>').text('結束時間: ');
    $('<input />', { id: `${id}-open-to` }).appendTo(open_to_label);
    modal.find(`#modalBody-${id}`).append(open_to_label);
    modal.find(`#modalBody-${id}`).append($('<br />'));

    // save button
    save_btn = $('<button />', { class: 'btn btn-sm btn-info', text: 'save' }).click(() => { addActivity(id) });
    modal.find(`#modalBody-${id}`).append($(save_btn));

    // trigger modal
    $(`#modal-${id}`).modal();
}

function operateFormatter(value, row, index) {
    return [
        `<a class="edit" href="#" title="edit">`,
        '<i class="fas fa-edit"></i>',
        '</a>  ',
    ].join('');
}

window.operateEvents = {
    'click .edit': function(e, value, row, index) {
        editActivity(row._id);
    },
};

function detailFormatter(index, row) {
    const html = [];
    const resp = $.ajax({
        url: '/options/getOptions',
        data: JSON.stringify({
            filter: {
                activity_id: row._id,
            },
        }),
        type: 'POST',
        dataType: 'json',
        headers: { Authorization: `Bearer ${jwtToken}` },
        contentType: 'application/json;charset=utf-8',
        async: false,
        success: function(resp) {
            return resp;
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(errorReloadText);
            return false;
        },
    }).responseJSON;
    if (resp) {
        const candidates = resp.data;
        const candidatesIdMapping = {};
        const result = getVotes(row._id, candidates);
        const numOfE = getNumOfElectors(row._id);
        console.log(numOfE);
        const voteStatics = result.statics;
        votes = result.votes;
        html.push('<ul><li><b>候選人：</b></li>');
        candidates.forEach((item) => {
            // TOOD: 投票結果排序
            const candidate = item.candidate;
            const id = item._id;
            candidatesIdMapping[id] = candidate.name;
            let vresult = [];
            if (voteStatics[id] !== undefined) {
                const vote = voteStatics[id];
                $.each(vote, (k, v) => {
                    vresult.push(v);
                });
            } else vresult = [0, 0, 0];
            const vsum = vresult[0] + vresult[1] + vresult[2];

            html.push(`<ul><li><b>${candidate.department}${candidate.name} - 投票結果統計(應投票人數為${numOfE}人)</b></li></ul>`);
            html.push(`
                <p></p>
                <div class="row justify-content-center">
                    <div class="col-lg-auto">
                        <table class="table table-responsive">
                            <tr class = "table-info text-center">
                                <th scope="col"></th>
                                <th scope="col">　　　同　意　　　</th>
                                <th scope="col">　　　反　對　　　</th>
                                <th scope="col">　　　無　效　　　</th>
                                <th scope="col">　　　總　計　　　</th>
                            </tr>
                            <tbody>
                            <tr class = "text-center">
                                <th scope="row">得　票　數</th>
                                <td>${vresult[0]}票</td>
                                <td>${vresult[1]}票</td>
                                <td>${vresult[2]}票</td>
                                <td>${vsum}票</td>
                            </tr>
                            <tr class = "text-center">
                                <th scope="row">得　票　率</th>
                                <td>${Math.round((vresult[0] / (vsum + 0.000001))*10000) / 100}%</td>
                                <td>${Math.round((vresult[1] / (vsum + 0.000001))*10000) / 100}%</td>
                                <td>${Math.round((vresult[2] / (vsum + 0.000001))*10000) / 100}%</td>
                                <td>100%</td/
                            </tr>
                            <tr class = "text-center">
                                <th scope="row">投　票　率</th>
                                <td>${Math.round((vresult[0] / (numOfE + 0.000001))*10000) / 100}%</td>
                                <td>${Math.round((vresult[1] / (numOfE + 0.000001))*10000) / 100}%</td>
                                <td>${Math.round((vresult[2] / (numOfE + 0.000001))*10000) / 100}%</td>
                                <td>${Math.round((vsum / (numOfE + 0.000001))*10000) / 100}%</td>
                            </tr>
                            </tbody>
                    </table>
                    </div>
                </div>
            `);
            
            if (voteStatics[id] !== undefined) {
                const vote = voteStatics[id];
                const chartId = `chart-${makeId(10)}`;
                html.push(`
                    <p></p>
                    <div class="row justify-content-center">
                        <div class="col-md-7">    
                            <canvas id="${chartId}"></canvas>
                        </div>
                    </div>
                `);
                chartQueue.push({ name: candidate.name, chartId, vote });
            }
            html.push('</ul>');
        });
        html.push('<ul><li><b>投票時間統計：</b></li></ul>');
        const timeChartId = `chart-${makeId(10)}`;
        html.push(`
            <div class="row justify-content-center">
                <div class="col-md-11">
                    <canvas id="${timeChartId}"></canvas>
                </div>
            </div>`);
        timeChartQueue.push({ time: result.vote_time, chartId: timeChartId });
        // 驗票
        let verificationBody = '';
        verificationBody += '<ol>';
        votes.forEach((vote) => {
            vote.choose_all.forEach((candidate) => {
                candidateName = candidatesIdMapping[candidate.option_id];
                verificationBody += `<li>Token: ${vote.token}: ${candidateName}: ${candidate.remark}</li>`;
            });
        });
        verificationBody += '</ol>';
        html.push(addModal(row._id, verificationBody));
        html.push(`
            <div class="row justify-content-center">
                <div class="col-md-7">
                    <button type="button" class="btn btn-secondary btn-lg btn-block" data-toggle="modal" data-target="#verification-${row._id}">
                        驗票
                    </button>
                </div>
            </div>`);
        return html.join('');

        function addModal(id, content) {
            return `
            <div class="modal fade" id="verification-${id}" tabindex="-1" role="dialog" aria-labelledby="verificationTitle-${id}"
                aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="verificationTitle-${id}">驗票</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body" id="verificationBody-${id}">${content}</div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">
                                關閉
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
    }
}

function getVotes(activityId, candidates) {
    const resp = $.ajax({
        url: '/votes/getVotes',
        data: JSON.stringify({
            filter: {
                activity_id: activityId,
            },
        }),
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        headers: { 'Authorization': `Bearer ${jwtToken}` },
        async: false,
        success: function(resp) {
            return resp;
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert('發生錯誤，請確認您是否擁有管理員權限！');
            return false;
        },
    }).responseJSON;
    if (resp) {
        const votes = resp.data;
        const statics = {};
        const vote_time = [];
        candidates.forEach((item) => {
            // 加入該候選人
            statics[item._id] = {
                '我要投給他': 0,
                '我不投給他': 0,
                '我沒有意見': 0,
            };
        });
        votes.forEach((vote) => {
            (vote.choose_all).forEach((candidate) => {
                const remark = candidate.remark;
                // 加入該投票選項
                statics[candidate.option_id][remark] += 1;
            });
            vote_time.push(moment(vote.created_at).startOf('hour').toDate());
        });
        return { statics, votes, vote_time };
    }
}

function getNumOfElectors(activityId) {
    const resp = $.ajax({
        url: '/votes/getNumOfElectors',
        data: JSON.stringify({
            activity_id: activityId,
        }),
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        headers: { 'Authorization': `Bearer ${jwtToken}` },
        async: false,
        success: function(resp) {
            return resp;
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert('發生錯誤，請確認您是否擁有管理員權限！');
            return false;
        },
    }).responseJSON;
    if (resp) {
        return resp.nums;
    }
}

function makeId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function drawChart() {
    for (let i = 0; i < chartQueue.length; i++) {
        const element = chartQueue[i];
        if (element.drawn == true) continue;
        const ctx = document.getElementById(element.chartId);
        if (ctx == undefined) continue;
        const label = Object.keys(element.vote);
        const data = Object.values(element.vote);
        new Chart(ctx, {
            type: 'pie',
            data: {
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#4d72bd',
                        '#dd8143',
                        '#a3a3a3',
                        '#42f57e',
                    ],
                    label: element.name,
                }],
                labels: label,
            },
            options: {
                responsive: true,
                animation: {
                    duration: 500,
                    easing: 'easeOutQuart',
                    onComplete: function() {
                        const ctx = this.chart.ctx;
                        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        this.data.datasets.forEach(function(dataset) {
                            for (let i = 0; i < dataset.data.length; i++) {
                                const model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                                const total = dataset._meta[Object.keys(dataset._meta)[0]].total;
                                const mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2;
                                const start_angle = model.startAngle;
                                const end_angle = model.endAngle;
                                const mid_angle = start_angle + (end_angle - start_angle) / 2;

                                const x = mid_radius * Math.cos(mid_angle);
                                const y = mid_radius * Math.sin(mid_angle);

                                ctx.fillStyle = '#fff';
                                if (i == 3) { // Darker text color for lighter background
                                    ctx.fillStyle = '#444';
                                }
                                const percent = String(Math.round(dataset.data[i] / total * 100)) + '%';
                                // Don't Display If Legend is hide or value is 0
                                // if (dataset.data[i] != 0 && dataset._meta[0].data[i].hidden != true) {
                                ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                                // Display percent in another line, line break doesn't work for fillText
                                ctx.fillText(percent, model.x + x, model.y + y + 15);
                                // }
                            }
                        });
                    },
                },
            },
        });
        element['drawn'] = true;
    }
}

function drawTimeChart() {
    for (let i = 0; i < timeChartQueue.length; i++) {
        const element = timeChartQueue[i];
        if (element.drawn == true) continue;
        const ctx = document.getElementById(element.chartId);
        if (ctx == undefined) continue;
        // process datetime
        const data = [];
        const sortedArray = element.time.sort((a, b) => a.getTime() - b.getTime());
        sortedArray.forEach(t => {
            let saved = false;
            for (i = 0; i < data.length; i++) {
                if (data[i].x.getTime() == t.getTime()) {
                    data[i].y += 1
                    saved = true;
                    break;
                }
            }
            if (!saved) {
                data.push({ x: t, y: 1 });
            }
        })
        const bgColor = ['#4d72bd', '#dd8143', '#a3a3a3', '#42f57e', '#ff0000']
        backgroundColor = () => {
            let tmp = [];
            for (i = 0; i < data.length; i++) {
                tmp.push(bgColor[i % bgColor.length]);
            }
            return tmp;
        }
        var chart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
                }],
            },

            options: {
                responsive: true,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'hour',

                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                        }
                    }]
                },

            }
        });
        element['drawn'] = true;
    }
}