import json
import gzip
import csv
from datetime import datetime

months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def parse(path):
    g = gzip.open(path, 'rb')
    for l in g:
        yield json.loads(l)


def meta_data_processing(meta_data_path, out_path):
    meta_data_dic = {}
    for review in parse(meta_data_path):
        try:
            asin = review['asin']
            title = review['title']
            try:
                brand = review['brand']
            except:
                brand = None
            try:
                sub_categories = review['categories']
            except:
                sub_categories = None
            if asin not in meta_data_dic:
                meta_data_dic[asin] = {'title': title, 'brand': brand, 'sub_categories': sub_categories}
        except:
            print(review)

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(meta_data_dic, f, ensure_ascii=False, indent=4)


def load_ratings_data(ratings_csv_path):
    with open(ratings_csv_path, 'r', newline='') as f:
        reader = csv.reader(f)
        ratings_list = list(reader)

    monthly_dic = {}
    for rating in ratings_list:
        ts = int(rating[3])
        month = datetime.utcfromtimestamp(ts).month
        if month not in monthly_dic:
            sub_dic = {}
            sub_dic[rating[0]] = [float(rating[2]), 1]
            monthly_dic[month] = sub_dic
        else:
            sub_dic = monthly_dic[month]
            if rating[0] not in sub_dic:
                sub_dic[rating[0]] = [float(rating[2]), 1]
            else:
                asin_rating = sub_dic[rating[0]]
                sub_dic[rating[0]] = [asin_rating[0] + float(rating[2]), asin_rating[1] + 1]
            monthly_dic[month] = sub_dic
    return monthly_dic


# monthly top10 avg_ratings
def top10_avg_ratings_data(monthly_dic, meta_data, output_json_path, bad_asin):
    top10_ratings_results = {}
    for i in range(1, 13):
        asin_rating_list = []
        sub_dic = monthly_dic[i]
        for asin in sub_dic:
            if (sub_dic[asin][1] >= 15) and (asin not in bad_asin):
                asin_rating_list.append([asin, sub_dic[asin][0] / float(sub_dic[asin][1]), sub_dic[asin][1]])
        asin_rating_list = sorted(asin_rating_list, key=lambda x: x[1])[::-1][:10]
        sub_res = {}
        for item in asin_rating_list:
            # print (item[0])
            # print(meta_data[item[0]])
            sub_res[item[0]] = {'title': meta_data[item[0]]['title'], 'avg_ratings': item[1], 'num_ratings': item[2],
                                'brand': meta_data[item[0]]['brand'],
                                'sub_categories': meta_data[item[0]]['sub_categories']}
        top10_ratings_results[months[i]] = sub_res

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(top10_ratings_results, f, ensure_ascii=False, indent=4)


# monthly top10 most_ratings
def top10_most_ratings_data(monthly_dic, meta_data, output_json_path, bad_asin):
    most10_ratings_results = {}
    for i in range(1, 13):
        asin_rating_list = []
        sub_dic = monthly_dic[i]
        for asin in sub_dic:
            if asin not in bad_asin:
                asin_rating_list.append([asin, sub_dic[asin][0] / float(sub_dic[asin][1]), sub_dic[asin][1]])
        asin_rating_list = sorted(asin_rating_list, key=lambda x: x[2])[::-1][:10]
        sub_res = {}
        for item in asin_rating_list:
            # print (item[0])
            # print (jdata[item[0]])
            sub_res[item[0]] = {'title': meta_data[item[0]]['title'], 'avg_ratings': item[1], 'num_ratings': item[2],
                                'brand': meta_data[item[0]]['brand'],
                                'sub_categories': meta_data[item[0]]['sub_categories']}
        most10_ratings_results[months[i]] = sub_res

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(most10_ratings_results, f, ensure_ascii=False, indent=4)


def fashion_data_processing():
    fashion_bad_asin = ['B001XOQTSE', 'B00201ER88', 'B001FOOG0U']

    meta_data_processing('Fashion/raw_data/meta_AMAZON_FASHION.json.gz', 'Fashion/processed_data/meta_data.json')
    processed_meta_data = json.loads(open('Fashion/raw_data/meta_data.json').read())
    ratings_dic = load_ratings_data('Fashion/raw_data/AMAZON_FASHION.csv')
    top10_avg_ratings_data(ratings_dic, processed_meta_data, 'Fashion/processed_data/top10_avg_ratings.json',
                           fashion_bad_asin)
    top10_most_ratings_data(ratings_dic, processed_meta_data, 'Fashion/processed_data/top10_most_ratings.json',
                            fashion_bad_asin)


def all_beauty_data_processing():
    all_beauty_bad_asin = []

    meta_data_processing('All_Beauty/raw_data/meta_All_Beauty.json.gz', 'All_Beauty/raw_data/meta_data.json')
    processed_meta_data = json.loads(open('All_Beauty/raw_data/meta_data.json').read())
    ratings_dic = load_ratings_data('All_Beauty/raw_data/All_Beauty.csv')
    top10_avg_ratings_data(ratings_dic, processed_meta_data, 'All_Beauty/processed_data/top10_avg_ratings.json',
                           all_beauty_bad_asin)
    top10_most_ratings_data(ratings_dic, processed_meta_data, 'All_Beauty/processed_data/top10_most_ratings.json',
                            all_beauty_bad_asin)


def main():
    # fashion_data_processing()
    all_beauty_data_processing()


if __name__ == "__main__":
    main()
