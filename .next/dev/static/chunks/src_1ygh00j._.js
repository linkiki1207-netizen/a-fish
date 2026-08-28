(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/admin/purchasing/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PurchaseSummaryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.mjs [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-check.mjs [app-client] (ecmascript) <export default as UserCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check-check.mjs [app-client] (ecmascript) <export default as CheckCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$horizontal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SlidersHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs [app-client] (ecmascript) <export default as SlidersHorizontal>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function PurchaseSummaryPage() {
    _s();
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [batches, setBatches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedBatch, setSelectedBatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ALL');
    const [viewTab, setViewTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('need_buy');
    const [searchKeyword, setSearchKeyword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [updatingKey, setUpdatingKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 🟢 控制「部分採買數量調整」的彈窗或輸入狀態：key -> 實際買到數量
    const [customQtyMap, setCustomQtyMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PurchaseSummaryPage.useEffect": ()=>{
            fetchData();
        }
    }["PurchaseSummaryPage.useEffect"], []);
    const fetchData = async ()=>{
        setLoading(true);
        try {
            const { data: batchData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('batches').select('id, name').order('created_at', {
                ascending: false
            });
            if (batchData) setBatches(batchData);
            const { data: productData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('products').select('id, name, batch_id');
            if (productData) setProducts(productData);
            // 🟢 確保訂單依照 created_at 升序或降序抓取，我們後續會嚴格依下單時間排序
            const { data: orderData, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').select('*').order('created_at', {
                ascending: true
            }) // 先搶先贏：由舊到新排序
            ;
            if (error) throw error;
            if (orderData) setOrders(orderData);
        } catch (err) {
            console.error(err);
        } finally{
            setLoading(false);
        }
    };
    const resolveBatchName = (ord, item)=>{
        if (ord.note) {
            const cleanNote = ord.note.split(' (')[0];
            const found = batches.find((b)=>b.name === cleanNote);
            if (found) return found.name;
            if (cleanNote && cleanNote !== '連線訂單') return cleanNote;
        }
        if (item?.batch_name && item.batch_name !== 'DEFAULT' && item.batch_name !== '一般專區') {
            return item.batch_name;
        }
        if (ord.batch_id) {
            const found = batches.find((b)=>b.id === ord.batch_id);
            if (found) return found.name;
        }
        return '現貨專區';
    };
    const aggregatedMap = {};
    orders.forEach((ord)=>{
        if (ord.status === 'completed') return;
        if (ord.items && Array.isArray(ord.items)) {
            ord.items.forEach((item)=>{
                const itemBatchName = resolveBatchName(ord, item);
                const variant = item.selectedVariant || '單一規格';
                const key = `${itemBatchName}_${item.name}_${variant}`;
                const itemStatus = item.status || 'pending';
                if (!aggregatedMap[key]) {
                    aggregatedMap[key] = {
                        key,
                        productId: item.id || '',
                        name: item.name,
                        variant,
                        batch_id: item.batch_id || ord.batch_id || 'DEFAULT',
                        batch_name: itemBatchName,
                        totalQty: 0,
                        buyers: [],
                        overallStatus: 'pending'
                    };
                }
                aggregatedMap[key].totalQty += item.quantity || 1;
                aggregatedMap[key].buyers.push({
                    orderId: ord.id,
                    buyerName: ord.buyer_name || ord.line_name || '買家',
                    lineName: ord.line_name || '',
                    quantity: item.quantity || 1,
                    status: itemStatus,
                    createdAt: ord.created_at
                });
            });
        }
    });
    // 🟢 關鍵核心：讓每項商品的買家名單嚴格依照下單時間（created_at）由先到後排序（先搶先贏）
    Object.values(aggregatedMap).forEach((item)=>{
        item.buyers.sort((a, b)=>new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const allBought = item.buyers.every((b)=>b.status === 'bought');
        const allFailed = item.buyers.every((b)=>b.status === 'failed');
        const hasPending = item.buyers.some((b)=>b.status === 'pending');
        if (allBought) item.overallStatus = 'all_bought';
        else if (allFailed) item.overallStatus = 'all_failed';
        else if (!hasPending) item.overallStatus = 'mixed';
        else item.overallStatus = 'pending';
    });
    const aggregatedList = Object.values(aggregatedMap);
    const scopedList = aggregatedList.filter((item)=>{
        if (viewTab === 'need_buy') {
            return item.overallStatus === 'pending' || item.buyers.some((b)=>b.status === 'pending');
        } else {
            return item.overallStatus !== 'pending' && !item.buyers.some((b)=>b.status === 'pending');
        }
    });
    const filteredList = scopedList.filter((item)=>{
        const matchBatch = selectedBatch === 'ALL' || item.batch_name.includes(selectedBatch);
        const matchSearch = item.name.toLowerCase().includes(searchKeyword.toLowerCase()) || item.variant.toLowerCase().includes(searchKeyword.toLowerCase()) || item.buyers.some((b)=>b.lineName.toLowerCase().includes(searchKeyword.toLowerCase()));
        return matchBatch && matchSearch;
    });
    // 🟢 支援部分採買數量分配（先搶先贏分配邏輯）
    const handleAllocateQuantity = async (targetItem, availableQty)=>{
        setUpdatingKey(targetItem.key);
        try {
            let remainingQty = availableQty;
            // 追蹤每個訂單中該品項的新狀態
            const orderUpdates = {};
            // 依照先搶先贏順序配置數量
            targetItem.buyers.forEach((b)=>{
                let newBuyerStatus = 'failed';
                if (remainingQty >= b.quantity) {
                    newBuyerStatus = 'bought';
                    remainingQty -= b.quantity;
                } else {
                    newBuyerStatus = 'failed'; // 數量不足，後面的人分配不到顯示缺貨
                }
                const order = orders.find((o)=>o.id === b.orderId);
                if (!order || !order.items) return;
                if (!orderUpdates[b.orderId]) {
                    orderUpdates[b.orderId] = {
                        items: [
                            ...order.items
                        ]
                    };
                }
                orderUpdates[b.orderId].items = orderUpdates[b.orderId].items.map((it)=>{
                    const itVariant = it.selectedVariant || '單一規格';
                    if (it.name === targetItem.name && itVariant === targetItem.variant) {
                        return {
                            ...it,
                            status: newBuyerStatus
                        };
                    }
                    return it;
                });
            });
            // 寫回 Supabase 資料庫
            for (const [orderId, data] of Object.entries(orderUpdates)){
                const order = orders.find((o)=>o.id === orderId);
                if (!order) continue;
                let hasPendingInOrder = false;
                let hasValidItemInOrder = false;
                data.items.forEach((it)=>{
                    const st = it.status || 'pending';
                    if (st === 'pending') hasPendingInOrder = true;
                    if (st !== 'failed') hasValidItemInOrder = true;
                });
                let newOrderStatus = order.status;
                if (!hasPendingInOrder) {
                    newOrderStatus = hasValidItemInOrder ? 'bought' : 'failed';
                }
                const validTotalAmount = data.items.filter((it)=>it.status !== 'failed').reduce((sum, it)=>sum + (it.price || 0) * (it.quantity || 1), 0);
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').update({
                    items: data.items,
                    status: newOrderStatus,
                    total_amount: validTotalAmount,
                    total_price: validTotalAmount
                }).eq('id', orderId);
            }
            await fetchData();
        } catch (err) {
            console.error('分配數量失敗:', err);
            alert('操作失敗，請重試');
        } finally{
            setUpdatingKey(null);
        }
    };
    // 傳統整張卡片一鍵更新（全部買到 / 全部缺貨 / 復原）
    const handleBatchUpdateCardStatus = async (targetItem, newStatus)=>{
        setUpdatingKey(targetItem.key);
        try {
            const affectedOrderIds = Array.from(new Set(targetItem.buyers.map((b)=>b.orderId)));
            for (const orderId of affectedOrderIds){
                const order = orders.find((o)=>o.id === orderId);
                if (!order || !order.items) continue;
                const updatedItems = order.items.map((it)=>{
                    const itVariant = it.selectedVariant || '單一規格';
                    if (it.name === targetItem.name && itVariant === targetItem.variant) {
                        return {
                            ...it,
                            status: newStatus
                        };
                    }
                    return it;
                });
                let hasPendingInOrder = false;
                let hasValidItemInOrder = false;
                updatedItems.forEach((it)=>{
                    const st = it.status || 'pending';
                    if (st === 'pending') hasPendingInOrder = true;
                    if (st !== 'failed') hasValidItemInOrder = true;
                });
                let newOrderStatus = order.status;
                if (newStatus === 'pending') {
                    newOrderStatus = 'pending_buy';
                } else if (!hasPendingInOrder) {
                    newOrderStatus = hasValidItemInOrder ? 'bought' : 'failed';
                }
                const validTotalAmount = updatedItems.filter((it)=>it.status !== 'failed').reduce((sum, it)=>sum + (it.price || 0) * (it.quantity || 1), 0);
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').update({
                    items: updatedItems,
                    status: newOrderStatus,
                    total_amount: validTotalAmount,
                    total_price: validTotalAmount
                }).eq('id', orderId);
            }
            await fetchData();
        } catch (err) {
            console.error('批次更新失敗:', err);
            alert('操作失敗，請重試');
        } finally{
            setUpdatingKey(null);
        }
    };
    const totalRequiredPieces = aggregatedList.reduce((sum, item)=>sum + item.totalQty, 0);
    const totalCompletedPieces = aggregatedList.filter((i)=>i.overallStatus !== 'pending' && !i.buyers.some((b)=>b.status === 'pending')).reduce((sum, item)=>sum + item.totalQty, 0);
    const needBuyList = aggregatedList.filter((item)=>item.overallStatus === 'pending' || item.buyers.some((b)=>b.status === 'pending'));
    const purchasedHistoryList = aggregatedList.filter((item)=>item.overallStatus !== 'pending' && !item.buyers.some((b)=>b.status === 'pending'));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 md:p-8 space-y-6 max-w-7xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl font-black text-white flex items-center gap-2.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                                        className: "w-5 h-5 text-emerald-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 334,
                                        columnNumber: 13
                                    }, this),
                                    "現場採購彙總清單 (先搶先贏自動分配)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 333,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-400 mt-1",
                                children: "買家名單已依下單時間先後排序。若數量不足，可輸入實際買到數量自動分配得標者！"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 337,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                        lineNumber: 332,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-400",
                                        children: "已採買進度"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 344,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-emerald-400 font-mono font-bold text-base",
                                        children: [
                                            totalCompletedPieces,
                                            " / ",
                                            totalRequiredPieces,
                                            " 件"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 345,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 343,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: fetchData,
                                className: "p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        className: `w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 353,
                                        columnNumber: 13
                                    }, this),
                                    "重新整理"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 349,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                        lineNumber: 342,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                lineNumber: 331,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-3 max-w-md p-1.5 bg-slate-900 border border-slate-800 rounded-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setViewTab('need_buy');
                            setSelectedBatch('ALL');
                        },
                        className: `py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${viewTab === 'need_buy' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 368,
                                columnNumber: 11
                            }, this),
                            " 尚需採買 (",
                            needBuyList.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                        lineNumber: 360,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setViewTab('purchased_history');
                            setSelectedBatch('ALL');
                        },
                        className: `py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${viewTab === 'purchased_history' ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCheck$3e$__["CheckCheck"], {
                                className: "w-4 h-4 text-emerald-400"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 379,
                                columnNumber: 11
                            }, this),
                            " 已採買紀錄 (",
                            purchasedHistoryList.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                        lineNumber: 371,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                lineNumber: 359,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2 pb-1 overflow-x-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setSelectedBatch('ALL'),
                        className: `px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${selectedBatch === 'ALL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`,
                        children: [
                            "全部 (",
                            scopedList.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                        lineNumber: 384,
                        columnNumber: 9
                    }, this),
                    batches.map((b)=>{
                        const count = scopedList.filter((i)=>i.batch_name.includes(b.name) || b.name.includes(i.batch_name)).length;
                        if (count === 0) return null;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setSelectedBatch(b.name),
                            className: `px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${selectedBatch === b.name ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`,
                            children: [
                                b.name,
                                " (",
                                count,
                                ")"
                            ]
                        }, b.id, true, {
                            fileName: "[project]/src/app/admin/purchasing/page.tsx",
                            lineNumber: 398,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                lineNumber: 383,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                        className: "w-4 h-4 text-slate-500 absolute left-4 top-3.5"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                        lineNumber: 414,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "搜尋品項名稱、規格或買家姓名...",
                        value: searchKeyword,
                        onChange: (e)=>setSearchKeyword(e.target.value),
                        className: "w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                        lineNumber: 415,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                lineNumber: 413,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-16 text-slate-500 text-xs",
                children: "載入採買清單中..."
            }, void 0, false, {
                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                lineNumber: 425,
                columnNumber: 9
            }, this) : filteredList.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-16 text-center text-slate-500 text-xs",
                children: viewTab === 'need_buy' ? '🎉 太棒了！當前分頁所有品項都已經採買完畢！' : '目前沒有已採買的紀錄'
            }, void 0, false, {
                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                lineNumber: 427,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
                children: filteredList.map((item)=>{
                    const isBought = item.overallStatus === 'all_bought';
                    const isFailed = item.overallStatus === 'all_failed';
                    const isCompleted = item.overallStatus !== 'pending';
                    const isUpdating = updatingKey === item.key;
                    const currentCustomQty = customQtyMap[item.key] !== undefined ? customQtyMap[item.key] : item.totalQty;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `border rounded-3xl p-5 space-y-4 shadow-xl transition relative overflow-hidden ${isBought ? 'bg-emerald-950/20 border-emerald-500/40' : isFailed ? 'bg-rose-950/20 border-rose-500/40 opacity-75' : isCompleted ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-start",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md font-bold block w-fit mb-1",
                                                children: item.batch_name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                lineNumber: 454,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: `text-base font-black ${isFailed ? 'line-through text-slate-400' : 'text-white'}`,
                                                children: item.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                lineNumber: 457,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 mt-1 inline-block font-mono",
                                                children: [
                                                    "規格: ",
                                                    item.variant
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                lineNumber: 460,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 453,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-right flex flex-col items-end",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-slate-400",
                                                children: "總喊單數"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                lineNumber: 466,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-2xl font-black font-mono text-emerald-400 mt-0.5",
                                                children: item.totalQty
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                lineNumber: 467,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 465,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 452,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pt-3 border-t border-slate-800/80 space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between text-[11px] text-slate-400",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"], {
                                                    className: "w-3.5 h-3.5 text-emerald-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                    lineNumber: 476,
                                                    columnNumber: 23
                                                }, this),
                                                "訂購買家名單 (依下單時間排序)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                            lineNumber: 475,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 474,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1 max-h-36 overflow-y-auto pr-1",
                                        children: item.buyers.map((b, bIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800/60 flex items-center justify-between text-[11px]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 truncate",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-500 font-mono text-[10px]",
                                                                children: [
                                                                    "#",
                                                                    bIdx + 1
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                                lineNumber: 488,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-300 truncate max-w-[120px]",
                                                                children: b.lineName
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                                lineNumber: 489,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                        lineNumber: 487,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 font-mono",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-emerald-400 font-bold",
                                                                children: [
                                                                    "× ",
                                                                    b.quantity
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                                lineNumber: 492,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-[10px] px-1.5 py-0.2 rounded font-sans ${b.status === 'bought' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : b.status === 'failed' ? 'bg-rose-500/20 text-rose-400' : 'text-amber-400'}`,
                                                                children: b.status === 'bought' ? '✓ 買到' : b.status === 'failed' ? '✕ 缺貨' : '搶單中'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                                lineNumber: 493,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                        lineNumber: 491,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, bIdx, true, {
                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                lineNumber: 483,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 481,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 473,
                                columnNumber: 17
                            }, this),
                            viewTab === 'need_buy' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pt-2 border-t border-slate-800 flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] text-slate-400 whitespace-nowrap",
                                        children: "實買數量:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 511,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: 0,
                                        max: item.totalQty,
                                        value: currentCustomQty,
                                        onChange: (e)=>setCustomQtyMap({
                                                ...customQtyMap,
                                                [item.key]: Number(e.target.value)
                                            }),
                                        className: "w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-center text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 512,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        disabled: isUpdating,
                                        onClick: ()=>handleAllocateQuantity(item, currentCustomQty),
                                        className: "flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$horizontal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SlidersHorizontal$3e$__["SlidersHorizontal"], {
                                                className: "w-3.5 h-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                lineNumber: 528,
                                                columnNumber: 23
                                            }, this),
                                            " 依序分配"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                        lineNumber: 523,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 510,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pt-2 border-t border-slate-800 flex gap-2",
                                children: viewTab === 'need_buy' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            disabled: isUpdating,
                                            onClick: ()=>handleBatchUpdateCardStatus(item, 'bought'),
                                            className: "flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer bg-slate-950 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                    lineNumber: 541,
                                                    columnNumber: 25
                                                }, this),
                                                " 全部買到"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                            lineNumber: 536,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            disabled: isUpdating,
                                            onClick: ()=>handleBatchUpdateCardStatus(item, 'failed'),
                                            className: "flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer bg-slate-950 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                                    lineNumber: 549,
                                                    columnNumber: 25
                                                }, this),
                                                " 全部缺貨"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                            lineNumber: 544,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                    lineNumber: 535,
                                    columnNumber: 21
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    disabled: isUpdating,
                                    onClick: ()=>handleBatchUpdateCardStatus(item, 'pending'),
                                    className: "w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                            className: "w-3.5 h-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                            lineNumber: 558,
                                            columnNumber: 23
                                        }, this),
                                        " 返回尚需採買 (復原)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                    lineNumber: 553,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                                lineNumber: 533,
                                columnNumber: 17
                            }, this)
                        ]
                    }, item.key, true, {
                        fileName: "[project]/src/app/admin/purchasing/page.tsx",
                        lineNumber: 440,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/admin/purchasing/page.tsx",
                lineNumber: 431,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin/purchasing/page.tsx",
        lineNumber: 330,
        columnNumber: 5
    }, this);
}
_s(PurchaseSummaryPage, "C0iiqQQpmfAgVqXsx3bjxtYJiNo=");
_c = PurchaseSummaryPage;
var _c;
__turbopack_context__.k.register(_c, "PurchaseSummaryPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://utimhsphtmyefyshmasy.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_j_V082DfhAk23zmoUrevRw_mdxvPFTe");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1ygh00j._.js.map