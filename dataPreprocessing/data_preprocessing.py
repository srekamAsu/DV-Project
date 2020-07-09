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
    print('<---Start processing meta_data--->')
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
                sub_categories = review['category']
            except:
                sub_categories = None
            if asin not in meta_data_dic:
                meta_data_dic[asin] = {'title': title, 'brand': brand, 'sub_categories': sub_categories}
        except:
            print(review)

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(meta_data_dic, f, ensure_ascii=False, indent=4)
    print('<---End processing meta_data--->')


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
def top10_avg_ratings_data(monthly_dic, meta_data, output_json_path):
    print('<---Start processing top10_avg_data--->')
    top10_ratings_results = {}
    for i in range(1, 13):
        asin_rating_list = []
        sub_dic = monthly_dic[i]
        for asin in sub_dic:
            if (sub_dic[asin][1] >= 15):
                asin_rating_list.append([asin, sub_dic[asin][0] / float(sub_dic[asin][1]), sub_dic[asin][1]])
        asin_rating_list = sorted(asin_rating_list, key=lambda x: x[1])[::-1]
        sub_res = {}
        count = 0
        for item in asin_rating_list:
            try:
                # print (item[0])
                # print(meta_data[item[0]])
                if 'ue_t0=ue_t0||+new Date()' not in meta_data[item[0]]['title']:
                    sub_res[item[0]] = {'title': meta_data[item[0]]['title'], 'avg_ratings': item[1],
                                        'num_ratings': item[2],
                                        'brand': meta_data[item[0]]['brand'],
                                        'sub_categories': meta_data[item[0]]['sub_categories']}
                    count += 1
                    if count == 10:
                        break
                else:
                    print('Bad asin: ' + item[0])
            except:
                print('Bad asin: ' + item[0])

        top10_ratings_results[months[i]] = sub_res

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(top10_ratings_results, f, ensure_ascii=False, indent=4)
    print('<---End processing top10_avg_data--->')


# monthly top10 most_ratings
def top10_most_ratings_data(monthly_dic, meta_data, output_json_path):
    print('<---Start processing top10_most_data--->')
    most10_ratings_results = {}
    for i in range(1, 13):
        asin_rating_list = []
        sub_dic = monthly_dic[i]
        for asin in sub_dic:
            asin_rating_list.append([asin, sub_dic[asin][0] / float(sub_dic[asin][1]), sub_dic[asin][1]])
        asin_rating_list = sorted(asin_rating_list, key=lambda x: x[2])[::-1]
        sub_res = {}
        count = 0
        for item in asin_rating_list:
            try:
                # print (item[0])
                # print (jdata[item[0]])
                if 'ue_t0=ue_t0||+new Date()' not in meta_data[item[0]]['title']:
                    sub_res[item[0]] = {'title': meta_data[item[0]]['title'], 'avg_ratings': item[1],
                                        'num_ratings': item[2],
                                        'brand': meta_data[item[0]]['brand'],
                                        'sub_categories': meta_data[item[0]]['sub_categories']}
                    count += 1
                    if count == 10:
                        break
                else:
                    print('Bad asin: ' + item[0])
            except:
                print('Bad asin: ' + item[0])
        most10_ratings_results[months[i]] = sub_res

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(most10_ratings_results, f, ensure_ascii=False, indent=4)
    print('<---End processing top10_most_data--->')


def data_processing(category):
    print('<------Start for ' + category + ' ------>')
    meta_data_processing('../top10_data/' + category + '/raw/meta_' + category + '.json.gz',
                         '../top10_data/' + category + '/raw/meta_data.json')
    processed_meta_data = json.loads(open('../top10_data/' + category + '/raw/meta_data.json').read())
    ratings_dic = load_ratings_data('../top10_data/' + category + '/raw/' + category + '.csv')
    top10_avg_ratings_data(ratings_dic, processed_meta_data,
                           '../top10_data/' + category + '/processed_data/top10_avg_ratings.json')
    top10_most_ratings_data(ratings_dic, processed_meta_data,
                            '../top10_data/' + category + '/processed_data/top10_most_ratings.json')
    print('<------End for ' + category + ' ------>')


def main():
    # Completed Categories
    # data_processing('AMAZON_FASHION')
    # data_processing('All_Beauty')
    # data_processing('Appliances')
    # data_processing('Arts_Crafts_and_Sewing')
    # data_processing('Automotive')
    # data_processing('CDs_and_Vinyl')
    # data_processing('Cell_Phones_and_Accessories')
    # data_processing('Clothing_Shoes_and_Jewelry')
    # data_processing('Digital_Music')
    # data_processing('Electronics')
    # data_processing('Gift_Cards')
    # data_processing('Grocery_and_Gourmet_Food')
    # data_processing('Home_and_Kitchen')
    # data_processing('Industrial_and_Scientific')
    # data_processing('Kindle_Store')
    # data_processing('Luxury_Beauty')
    # data_processing('Magazine_Subscriptions')
    # data_processing('Movies_and_TV')
    # data_processing('Musical_Instruments')
    # data_processing('Office_Products')
    # data_processing('Patio_Lawn_and_Garden')
    # data_processing('Pet_Supplies')
    # data_processing('Prime_Pantry')
    # data_processing('Software')
    # data_processing('Sports_and_Outdoors')
    # data_processing('Tools_and_Home_Improvement')
    # data_processing('Toys_and_Games')
    # data_processing('Video_Games')

    # Incompleted Categories

    data_processing('Books')
    pass


if __name__ == "__main__":
    main()
