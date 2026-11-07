#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
哈工大大学物理实验教材针对性精准抽取管道 (Targeted Extraction Pipeline)
基于 +15 线性页码偏移模型 (PDF页码 = 书本页码 + 15)
支持对赵海发《大学物理实验(第三版)》全书 65 个实验进行秒级靶向切片提取。
"""

import os
import sys
import glob
import json
import argparse
from typing import Dict, List, Optional, Tuple, Any

# 确保在 Windows 控制台或管道中输出标准 UTF-8 中文
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    import pypdf
except ImportError:
    pypdf = None

# 默认页码偏移常数：赵海发教材前置前言与目录占 15 页
PAGE_OFFSET = 15

# 本脚本所在目录与项目根目录
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
CATALOG_JSON_PATH = os.path.join(CURRENT_DIR, "catalog_index.json")


def load_catalog() -> Tuple[dict, List[dict]]:
    """加载全书 65 实验目录索引"""
    if os.path.exists(CATALOG_JSON_PATH):
        try:
            with open(CATALOG_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("book_meta", {}), data.get("experiments", [])
        except Exception as e:
            print(f"[!] 警告: 加载 {CATALOG_JSON_PATH} 失败: {e}，将使用内置备用目录。")

    # 内置轻量兜底目录
    fallback_experiments = [
        {"id": 5, "chapter": "第二章 基础性实验", "title": "液体黏度的测定", "category": "热学/流体黏滞", "book_start_page": 70, "page_count": 5, "pdf_start_page": 85, "aliases": ["液体黏度", "落球法"], "keywords": ["黏度", "斯托克斯"]},
        {"id": 22, "chapter": "第二章 基础性实验", "title": "光的等厚干涉现象与应用", "category": "光学/等厚干涉", "book_start_page": 151, "page_count": 5, "pdf_start_page": 166, "aliases": ["牛顿环与劈尖", "等厚干涉"], "keywords": ["牛顿环", "劈尖"]},
        {"id": 24, "chapter": "第二章 基础性实验", "title": "单缝和圆孔的夫琅禾费衍射", "category": "光学/衍射理论", "book_start_page": 160, "page_count": 5, "pdf_start_page": 175, "aliases": ["夫琅禾费衍射", "单缝衍射", "圆孔衍射"], "keywords": ["夫琅禾费", "衍射", "单缝"]},
        {"id": 28, "chapter": "第三章 综合性实验", "title": "用准稳态法测定不良导体的比热容和导热系数", "category": "热学/传热物性", "book_start_page": 179, "page_count": 4, "pdf_start_page": 194, "aliases": ["准稳态法", "不良导体导热系数"], "keywords": ["准稳态", "不良导体", "比热容", "导热系数"]},
        {"id": 29, "chapter": "第三章 综合性实验", "title": "测定空气中的声速", "category": "声学/波动力学", "book_start_page": 183, "page_count": 4, "pdf_start_page": 198, "aliases": ["测定声速", "空气声速"], "keywords": ["声速", "驻波法", "相位法"]},
        {"id": 32, "chapter": "第三章 综合性实验", "title": "霍尔效应", "category": "半导体/磁电效应", "book_start_page": 196, "page_count": 3, "pdf_start_page": 211, "aliases": ["霍尔效应", "实验三十二"], "keywords": ["霍尔效应", "霍尔灵敏度"]},
        {"id": 36, "chapter": "第三章 综合性实验", "title": "迈克耳孙干涉仪", "category": "光学/精密干涉", "book_start_page": 211, "page_count": 7, "pdf_start_page": 226, "aliases": ["迈克耳逊干涉仪", "实验三十六"], "keywords": ["迈克耳孙", "等倾干涉", "折射率"]}
    ]
    return {"total_experiments": len(fallback_experiments)}, fallback_experiments


def auto_detect_pdf() -> Optional[str]:
    """自动探测本地已存在的赵海发教材 PDF"""
    search_patterns = [
        r"C:\Users\wfy\Downloads\*大学物理实验(第三版)*赵海发*(1).pdf",
        r"C:\Users\wfy\Downloads\*大学物理实验(第三版)*赵海发*.pdf",
        r"C:\Users\wfy\Downloads\*大学物理实验*.pdf",
        os.path.join(PROJECT_ROOT, "*.pdf"),
        os.path.join(CURRENT_DIR, "*.pdf"),
    ]
    for pattern in search_patterns:
        matches = glob.glob(pattern)
        if matches:
            # 优先选择文件体积大于 50MB 的完整扫描版
            for match in sorted(matches, key=os.path.getsize, reverse=True):
                if os.path.getsize(match) > 10 * 1024 * 1024:
                    return match
            return matches[0]
    return None


def find_experiment(query: str, experiments: List[dict]) -> Optional[dict]:
    """多模态匹配实验元数据（支持序号、标题、别名、关键字与学期大纲别名）"""
    query = query.strip()
    if not query:
        return None

    # 1. 优先处理特殊学期大纲别名与常见语义对应关系
    # 用户注记的大纲序号可能与原书有别名关系：
    # "准稳态" / "比热容" / "导热系数" -> 实验28
    # "夫琅禾费" / "单缝" / "圆孔" -> 实验24
    # "声速" / "超声" -> 实验29
    # "液体黏度" / "落球法" -> 实验5
    keyword_map = [
        (["准稳态", "不良导体", "比热容", "导热系数"], 28),
        (["夫琅禾费", "单缝", "圆孔"], 24),
        (["声速", "空气声速"], 29),
        (["液体黏度", "液体粘度", "落球法", "蓖麻油"], 5),
        (["霍尔效应"], 32),
        (["迈克耳孙", "迈克耳逊", "迈克尔逊"], 36),
        (["等厚干涉", "牛顿环", "劈尖"], 22),
    ]
    for kw_list, target_id in keyword_map:
        for kw in kw_list:
            if kw in query:
                for exp in experiments:
                    if exp["id"] == target_id:
                        return exp

    # 2. 精确纯数字 ID 匹配 (如 "5", "28")
    if query.isdigit():
        target_id = int(query)
        for exp in experiments:
            if exp["id"] == target_id:
                return exp

    # 3. 匹配标题完全包含或别名包含
    clean_query = query.replace("实验", "").replace("《", "").replace("》", "").strip()
    for exp in experiments:
        if clean_query in exp["title"] or exp["title"] in clean_query:
            return exp
        for alias in exp.get("aliases", []):
            if clean_query in alias or alias in clean_query:
                return exp

    # 4. 匹配关键字
    for exp in experiments:
        for kw in exp.get("keywords", []):
            if kw in query or query in kw:
                return exp

    return None


def extract_experiment_pages(pdf_path: str, exp: dict, output_dir: str) -> dict:
    """提取单个实验高清页面图像并输出 manifest.json"""
    if pypdf is None:
        raise RuntimeError("缺少 pypdf 依赖。请使用 pip install pypdf 安装。")

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"未找到 PDF 文件: {pdf_path}")

    exp_id = exp["id"]
    book_start = exp["book_start_page"]
    page_count = exp["page_count"]
    pdf_start = exp.get("pdf_start_page", book_start + PAGE_OFFSET)

    os.makedirs(output_dir, exist_ok=True)
    exp_slug = f"exp_{exp_id:02d}_{exp['title'].replace(' ', '_').replace('——', '_')}"
    exp_dir = os.path.join(output_dir, exp_slug)
    os.makedirs(exp_dir, exist_ok=True)

    reader = pypdf.PdfReader(pdf_path)
    total_pdf_pages = len(reader.pages)

    extracted_files = []
    for offset_idx in range(page_count):
        cur_pdf_page = pdf_start + offset_idx
        if cur_pdf_page > total_pdf_pages:
            break
        page = reader.pages[cur_pdf_page - 1]
        cur_book_page = book_start + offset_idx

        # 抽取页面图像
        if page.images:
            img = page.images[0]
            ext = img.name.split(".")[-1] if "." in img.name else "jpg"
            if ext.lower() not in ["jpg", "jpeg", "png"]:
                ext = "jpg"
            img_filename = f"page_{offset_idx+1}_book_p{cur_book_page}_pdf_p{cur_pdf_page}.{ext}"
            img_path = os.path.join(exp_dir, img_filename)
            with open(img_path, "wb") as f:
                f.write(img.data)
            extracted_files.append({
                "page_index": offset_idx + 1,
                "book_page": cur_book_page,
                "pdf_page": cur_pdf_page,
                "image_file": img_filename,
                "bytes": len(img.data)
            })

    result = {
        "experiment_number": exp_id,
        "title": exp["title"],
        "chapter": exp.get("chapter", ""),
        "category": exp.get("category", ""),
        "book_start_page": book_start,
        "page_count": page_count,
        "pdf_start_page": pdf_start,
        "book_pages": f"{book_start}-{book_start + page_count - 1}",
        "pdf_pages": f"{pdf_start}-{pdf_start + page_count - 1}",
        "extracted_pages": extracted_files,
        "output_directory": exp_dir
    }

    manifest_path = os.path.join(exp_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return result


def print_catalog_list(experiments: List[dict]):
    """打印全书已索引实验列表"""
    print("=" * 86)
    print(f"{'序号':<6} | {'分类':<12} | {'实验名称':<32} | {'书本页':<8} | {'PDF页':<8} | {'页数':<4}")
    print("-" * 86)
    for exp in experiments:
        id_str = f"Exp {exp['id']:02d}"
        cat_str = exp.get("category", "")[:10]
        title_str = exp["title"][:28]
        bp_str = f"p.{exp['book_start_page']}"
        pp_str = f"p.{exp['pdf_start_page']}"
        pc_str = str(exp["page_count"])
        print(f"{id_str:<6} | {cat_str:<12} | {title_str:<32} | {bp_str:<8} | {pp_str:<8} | {pc_str:<4}")
    print("=" * 86)
    print(f"总计已索引实验数: {len(experiments)} 个 (覆盖第二章基础、第三章综合、第四章近现代)")


def main():
    parser = argparse.ArgumentParser(description="哈工大大学物理实验教材针对性精准抽取管道")
    parser.add_argument("--pdf", default=None, help="教材 PDF 文件路径 (默认自动探测 Downloads)")
    parser.add_argument("--exp", default=None, help="实验序号 (1-65) 或实验名称/关键词 (如 5、液体黏度、准稳态)")
    parser.add_argument("--out", default=os.path.join(PROJECT_ROOT, "extracted"), help="输出目录 (默认 extracted/)")
    parser.add_argument("--list", action="store_true", help="打印全书已索引的 65 个实验目录清单")
    parser.add_argument("--extract-all-targets", action="store_true", help="一键抽取本学期重点四大扩展实验 (液体黏度、准稳态、夫琅禾费、声速)")

    args = parser.parse_args()

    book_meta, experiments = load_catalog()

    if args.list:
        print_catalog_list(experiments)
        return

    # 确定 PDF 路径
    pdf_path = args.pdf
    if not pdf_path:
        pdf_path = auto_detect_pdf()
        if not pdf_path:
            print("[-] 错误: 未指定 --pdf，且在 Downloads 中未检测到大物教材 PDF。")
            print("    请使用 --pdf <路径> 指定本地教材 PDF。")
            sys.exit(1)
        print(f"[*] 自动检测到教材 PDF: {pdf_path}")
    else:
        if not os.path.exists(pdf_path):
            print(f"[-] 错误: 指定的 PDF 文件不存在: {pdf_path}")
            sys.exit(1)

    # 批量抽取重点四大目标实验
    if args.extract_all_targets:
        targets = ["液体黏度", "准稳态", "夫琅禾费", "声速"]
        print(f"[*] 正在批量靶向抽取四大重点实验章节: {targets}")
        for t in targets:
            exp = find_experiment(t, experiments)
            if exp:
                print(f"[+] 正在抽取 实验{exp['id']}《{exp['title']}》...")
                res = extract_experiment_pages(pdf_path, exp, args.out)
                print(f"    ✔ 成功抽取 {len(res['extracted_pages'])} 页 -> {res['output_directory']}")
        print(f"[★] 四大重点章节全部抽取完成！保存于: {args.out}")
        return

    if not args.exp:
        print("[-] 错误: 请提供 --exp <实验序号或名称>，或使用 --list 查看目录，或使用 --extract-all-targets。")
        parser.print_help()
        sys.exit(1)

    exp = find_experiment(args.exp, experiments)
    if not exp:
        print(f"[-] 未能在目录中匹配到实验: '{args.exp}'")
        print("    提示: 支持输入序号如 '5'，或关键词如 '液体黏度'、'准稳态'、'夫琅禾费'、'声速'。")
        sys.exit(1)

    print(f"[+] 匹配成功: 实验{exp['id']}《{exp['title']}》 ({exp.get('chapter', '')})")
    print(f"    教材页码: p.{exp['book_start_page']} ~ p.{exp['book_start_page'] + exp['page_count'] - 1} | PDF 页码: p.{exp['pdf_start_page']} ~ p.{exp['pdf_start_page'] + exp['page_count'] - 1} (共 {exp['page_count']} 页)")

    res = extract_experiment_pages(pdf_path, exp, args.out)
    print(f"[✔] 提取完成！共提取 {len(res['extracted_pages'])} 页高清图像")
    print(f"    输出目录: {res['output_directory']}")
    print(f"    清单文件: {os.path.join(res['output_directory'], 'manifest.json')}")


if __name__ == "__main__":
    main()
